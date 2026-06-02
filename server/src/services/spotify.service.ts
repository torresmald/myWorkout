import jwt from 'jsonwebtoken'

import { ErrorCode } from '../constants/error-codes.constants.js'
import {
  SPOTIFY_API_BASE_URL,
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_OAUTH_STATE_TTL,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
  SPOTIFY_TOKEN_URL,
  isSpotifyConfigured,
} from '../constants/spotify.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  SetSpotifyWorkoutPlaylistBody,
  SpotifyConnectionPublic,
  SpotifyOAuthStatePayload,
  SpotifyPlaylistItemResponse,
  SpotifyPlaylistPublic,
  SpotifyPlaylistsResponse,
  SpotifyTokenResponse,
  SpotifyUserProfileResponse,
} from '../interfaces/spotify.interface.js'
import { buildSpotifyPlaylistUrl, parseSpotifyPlaylistId } from '../utils/spotify.util.js'

const spotifyUserSelect = {
  id: true,
  spotifyUserId: true,
  spotifyAccessToken: true,
  spotifyRefreshToken: true,
  spotifyTokenExpiresAt: true,
  spotifyDisplayName: true,
  spotifyPlaylistName: true,
  spotifyPlaylistUrl: true,
} as const

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }

  return secret
}

function ensureSpotifyConfigured(): void {
  if (!isSpotifyConfigured()) {
    throw new AppError(ErrorCode.SPOTIFY_NOT_CONFIGURED, 503)
  }
}

function mapConnection(user: {
  spotifyUserId: string | null
  spotifyDisplayName: string | null
  spotifyPlaylistName: string | null
  spotifyPlaylistUrl: string | null
}): SpotifyConnectionPublic {
  const workoutPlaylistId = user.spotifyPlaylistUrl
    ? parseSpotifyPlaylistId(user.spotifyPlaylistUrl)
    : null

  return {
    connected: Boolean(user.spotifyUserId),
    displayName: user.spotifyDisplayName,
    workoutPlaylistId,
    workoutPlaylistName: user.spotifyPlaylistName,
    workoutPlaylistUrl: user.spotifyPlaylistUrl,
  }
}

function mapPlaylist(item: SpotifyPlaylistItemResponse | null): SpotifyPlaylistPublic | null {
  if (!item?.id || !item.name) {
    return null
  }

  return {
    id: item.id,
    name: item.name,
    url: item.external_urls?.spotify ?? buildSpotifyPlaylistUrl(item.id),
    imageUrl: item.images?.[0]?.url ?? null,
    trackCount: item.tracks?.total ?? 0,
  }
}

function getBasicAuthHeader(): string {
  return `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
}

async function requestSpotifyToken(body: URLSearchParams): Promise<SpotifyTokenResponse> {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: getBasicAuthHeader(),
    },
    body,
  })

  if (!response.ok) {
    throw new AppError(ErrorCode.SPOTIFY_OAUTH_FAILED, 401)
  }

  return (await response.json()) as SpotifyTokenResponse
}

async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyUserProfileResponse> {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new AppError(ErrorCode.SPOTIFY_API_ERROR, 502)
  }

  return (await response.json()) as SpotifyUserProfileResponse
}

async function saveSpotifyTokens(
  userId: number,
  tokenResponse: SpotifyTokenResponse,
  profile: SpotifyUserProfileResponse,
): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { spotifyRefreshToken: true },
  })
  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyUserId: profile.id,
      spotifyDisplayName: profile.display_name,
      spotifyAccessToken: tokenResponse.access_token,
      spotifyRefreshToken: tokenResponse.refresh_token ?? existing?.spotifyRefreshToken ?? null,
      spotifyTokenExpiresAt: expiresAt,
    },
  })
}

async function getSpotifyUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: spotifyUserSelect,
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  return user
}

async function refreshSpotifyAccessToken(userId: number, refreshToken: string): Promise<string> {
  const tokenResponse = await requestSpotifyToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  )

  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyAccessToken: tokenResponse.access_token,
      spotifyTokenExpiresAt: expiresAt,
      ...(tokenResponse.refresh_token ? { spotifyRefreshToken: tokenResponse.refresh_token } : {}),
    },
  })

  return tokenResponse.access_token
}

async function getValidAccessToken(userId: number): Promise<string> {
  const user = await getSpotifyUser(userId)

  if (!user.spotifyRefreshToken) {
    throw new AppError(ErrorCode.SPOTIFY_NOT_CONNECTED, 400)
  }

  const expiresAt = user.spotifyTokenExpiresAt?.getTime() ?? 0
  const isStillValid = Boolean(user.spotifyAccessToken) && expiresAt > Date.now() + 60_000

  if (isStillValid && user.spotifyAccessToken) {
    return user.spotifyAccessToken
  }

  return refreshSpotifyAccessToken(userId, user.spotifyRefreshToken)
}

async function spotifyApiFetch<T>(userId: number, path: string): Promise<T> {
  const accessToken = await getValidAccessToken(userId)
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 401) {
    const user = await getSpotifyUser(userId)

    if (!user.spotifyRefreshToken) {
      throw new AppError(ErrorCode.SPOTIFY_NOT_CONNECTED, 400)
    }

    const refreshedToken = await refreshSpotifyAccessToken(userId, user.spotifyRefreshToken)
    const retryResponse = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${refreshedToken}`,
      },
    })

    if (!retryResponse.ok) {
      throw new AppError(ErrorCode.SPOTIFY_API_ERROR, 502)
    }

    return (await retryResponse.json()) as T
  }

  if (!response.ok) {
    throw new AppError(ErrorCode.SPOTIFY_API_ERROR, 502)
  }

  return (await response.json()) as T
}

export function createSpotifyConnectUrl(userId: number): string {
  ensureSpotifyConfigured()

  const state = jwt.sign({ userId, purpose: 'spotify_oauth' } satisfies SpotifyOAuthStatePayload, getJwtSecret(), {
    expiresIn: SPOTIFY_OAUTH_STATE_TTL,
  })

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES.join(' '),
    state,
    show_dialog: 'true',
  })

  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`
}

export function verifySpotifyOAuthState(state: string): number {
  ensureSpotifyConfigured()

  if (!state.trim()) {
    throw new AppError(ErrorCode.SPOTIFY_OAUTH_FAILED, 400)
  }

  try {
    const payload = jwt.verify(state, getJwtSecret()) as SpotifyOAuthStatePayload

    if (payload.purpose !== 'spotify_oauth' || !Number.isInteger(payload.userId) || payload.userId <= 0) {
      throw new AppError(ErrorCode.SPOTIFY_OAUTH_FAILED, 400)
    }

    return payload.userId
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(ErrorCode.SPOTIFY_OAUTH_FAILED, 400)
  }
}

export async function connectSpotifyAccount(userId: number, code: string): Promise<void> {
  ensureSpotifyConfigured()

  if (!code.trim()) {
    throw new AppError(ErrorCode.SPOTIFY_OAUTH_FAILED, 400)
  }

  const tokenResponse = await requestSpotifyToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  )

  const profile = await fetchSpotifyProfile(tokenResponse.access_token)
  await saveSpotifyTokens(userId, tokenResponse, profile)
}

export async function getSpotifyConnection(userId: number): Promise<SpotifyConnectionPublic> {
  const user = await getSpotifyUser(userId)
  return mapConnection(user)
}

export async function getSpotifyPlaylists(userId: number): Promise<SpotifyPlaylistPublic[]> {
  const user = await getSpotifyUser(userId)

  if (!user.spotifyUserId) {
    throw new AppError(ErrorCode.SPOTIFY_NOT_CONNECTED, 400)
  }

  const data = await spotifyApiFetch<SpotifyPlaylistsResponse>(userId, '/me/playlists?limit=50')

  return (data.items ?? [])
    .map(mapPlaylist)
    .filter((playlist): playlist is SpotifyPlaylistPublic => playlist !== null)
}

export async function setSpotifyWorkoutPlaylist(
  userId: number,
  body: SetSpotifyWorkoutPlaylistBody,
): Promise<SpotifyConnectionPublic> {
  const playlistId = body.playlistId?.trim()

  if (!playlistId) {
    throw new AppError(ErrorCode.SPOTIFY_PLAYLIST_REQUIRED, 400)
  }

  const user = await getSpotifyUser(userId)

  if (!user.spotifyUserId) {
    throw new AppError(ErrorCode.SPOTIFY_NOT_CONNECTED, 400)
  }

  const playlist = await spotifyApiFetch<SpotifyPlaylistItemResponse>(userId, `/playlists/${playlistId}`)

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyPlaylistUrl: buildSpotifyPlaylistUrl(playlist.id),
      spotifyPlaylistName: playlist.name,
    },
    select: spotifyUserSelect,
  })

  return mapConnection(updated)
}

export async function disconnectSpotifyAccount(userId: number): Promise<SpotifyConnectionPublic> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyUserId: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null,
      spotifyDisplayName: null,
      spotifyPlaylistName: null,
      spotifyPlaylistUrl: null,
    },
    select: spotifyUserSelect,
  })

  return mapConnection(updated)
}

export function getSpotifyProfileRedirectUrl(status: 'connected' | 'error'): string {
  const appUrl = process.env.APP_URL?.trim() || 'http://localhost:5173'
  return `${appUrl.replace(/\/$/, '')}/profile?spotify=${status}`
}
