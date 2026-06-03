import '../config/env.js'
import '../config/cloudinary.js'

import { prisma } from '../config/prisma.js'
import { uploadCatalogMedia } from '../services/cloudinary.service.js'

const GIF_BASE_URL =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

interface CatalogSeedExercise {
  slug: string
  gifPath: string
  descriptionEs: string
  descriptionEn: string
}

const CATALOG_EXERCISES: CatalogSeedExercise[] = [
  {
    slug: 'bench-press',
    gifPath: 'videos/0025-EIeI8Vf.gif',
    descriptionEs:
      'Acuéstate en el banco, baja la barra al pecho y empuja hacia arriba.',
    descriptionEn: 'Lie on the bench, lower the bar to your chest, and press up.',
  },
  {
    slug: 'incline-bench-press',
    gifPath: 'videos/0047-3TZduzM.gif',
    descriptionEs:
      'En banco inclinado, baja la barra al pecho superior y empuja sin perder los hombros pegados al banco.',
    descriptionEn:
      'On an incline bench, lower the bar to the upper chest and press while keeping your shoulders pinned.',
  },
  {
    slug: 'push-up',
    gifPath: 'videos/0662-I4hDWkc.gif',
    descriptionEs:
      'Cuerpo en línea recta, baja el pecho controlando y empuja el suelo hasta extender codos.',
    descriptionEn:
      'Keep a straight body line, lower your chest under control, and push the floor to extend your elbows.',
  },
  {
    slug: 'pull-up',
    gifPath: 'videos/0652-lBDjFxJ.gif',
    descriptionEs:
      'Cuelga con agarre prono, tira del pecho hacia la barra y baja de forma controlada.',
    descriptionEn:
      'Hang with an overhand grip, pull your chest toward the bar, and lower under control.',
  },
  {
    slug: 'barbell-row',
    gifPath: 'videos/0027-eZyBC3j.gif',
    descriptionEs:
      'Inclina el torso, tira la barra hacia el abdomen y aprieta la espalda arriba.',
    descriptionEn:
      'Hinge forward, pull the bar toward your abdomen, and squeeze your back at the top.',
  },
  {
    slug: 'lat-pulldown',
    gifPath: 'videos/0198-RVwzP10.gif',
    descriptionEs:
      'Tira la barra hacia la clavícula con el pecho alto y controla la subida.',
    descriptionEn:
      'Pull the bar toward your collarbone with your chest up and control the return.',
  },
  {
    slug: 'squat',
    gifPath: 'videos/0043-qXTaZnJ.gif',
    descriptionEs:
      'Barra sobre trapecios, baja flexionando rodillas y cadera, sube empujando el suelo.',
    descriptionEn:
      'Bar on upper back, lower by bending knees and hips, drive up through the floor.',
  },
  {
    slug: 'deadlift',
    gifPath: 'videos/0032-ila4NZS.gif',
    descriptionEs:
      'Pies al ancho de caderas, espalda neutra, empuja el suelo y extiende cadera al subir.',
    descriptionEn:
      'Feet hip-width, neutral spine, push the floor and extend your hips as you stand.',
  },
  {
    slug: 'romanian-deadlift',
    gifPath: 'videos/0085-wQ2c4XD.gif',
    descriptionEs:
      'Empuja la cadera atrás con rodillas semi-flexionadas y baja la barra por delante de las piernas.',
    descriptionEn:
      'Push your hips back with soft knees and lower the bar along your legs.',
  },
  {
    slug: 'lunge',
    gifPath: 'videos/0054-t8iSghb.gif',
    descriptionEs:
      'Da un paso largo, baja la rodilla trasera y empuja con la pierna delantera para subir.',
    descriptionEn:
      'Step forward, lower your back knee, and drive through the front leg to stand.',
  },
  {
    slug: 'leg-press',
    gifPath: 'videos/1463-2Qh2J1e.gif',
    descriptionEs:
      'Pies a ancho de hombros en la plataforma, baja controlando y empuja sin bloquear rodillas.',
    descriptionEn:
      'Feet shoulder-width on the platform, lower under control, and press without locking your knees.',
  },
  {
    slug: 'hip-thrust',
    gifPath: 'videos/1409-qKBpF7I.gif',
    descriptionEs:
      'Espalda alta en banco, empuja la cadera hacia arriba apretando glúteos y baja controlando.',
    descriptionEn:
      'Upper back on a bench, drive your hips up squeezing glutes, and lower under control.',
  },
  {
    slug: 'calf-raise',
    gifPath: 'videos/0605-ykUOVze.gif',
    descriptionEs:
      'De pie, eleva los talones lo máximo posible, pausa arriba y baja de forma controlada.',
    descriptionEn:
      'Stand tall, rise onto your toes, pause at the top, and lower under control.',
  },
  {
    slug: 'overhead-press',
    gifPath: 'videos/1457-Kyd9Rz5.gif',
    descriptionEs:
      'Barra a la clavícula, empuja por encima de la cabeza sin arquear excesivamente la zona lumbar.',
    descriptionEn:
      'Bar at collarbone height, press overhead without excessive lower-back arch.',
  },
  {
    slug: 'lateral-raise',
    gifPath: 'videos/0334-DsgkuIt.gif',
    descriptionEs:
      'Eleva las mancuernas a los lados hasta la altura de los hombros y baja controlando.',
    descriptionEn:
      'Raise dumbbells out to the sides to shoulder height and lower under control.',
  },
  {
    slug: 'face-pull',
    gifPath: 'videos/0203-wqNPGCg.gif',
    descriptionEs:
      'Tira la cuerda hacia la cara separando codos y aprieta la parte posterior del hombro.',
    descriptionEn:
      'Pull the rope toward your face, flare the elbows, and squeeze the rear delts.',
  },
  {
    slug: 'barbell-curl',
    gifPath: 'videos/0031-25GPyDY.gif',
    descriptionEs:
      'Codos fijos a los lados, flexiona los codos llevando la barra hacia los hombros.',
    descriptionEn:
      'Keep elbows at your sides and curl the bar toward your shoulders.',
  },
  {
    slug: 'triceps-pushdown',
    gifPath: 'videos/0201-3ZflifB.gif',
    descriptionEs:
      'Codos pegados al cuerpo, extiende los brazos hacia abajo apretando tríceps.',
    descriptionEn:
      'Keep elbows tucked and extend your arms downward, squeezing the triceps.',
  },
  {
    slug: 'plank',
    gifPath: 'videos/2135-VBAWRPG.gif',
    descriptionEs:
      'Apoya antebrazos y puntas de los pies, mantén el cuerpo recto y el core activo.',
    descriptionEn:
      'Support on forearms and toes, keep your body straight and core braced.',
  },
  {
    slug: 'crunch',
    gifPath: 'videos/0267-kjJ3VoQ.gif',
    descriptionEs:
      'Flexiona el tronco llevando los hombros hacia la pelvis sin tirar del cuello.',
    descriptionEn:
      'Curl your torso bringing shoulders toward your pelvis without pulling on your neck.',
  },
]

async function downloadGif(path: string): Promise<Buffer> {
  const response = await fetch(`${GIF_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Failed to download ${path}: ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function seedCatalogMedia() {
  const results: Array<{ slug: string; mediaUrl: string; mediaType: string }> = []

  for (const exercise of CATALOG_EXERCISES) {
    console.log(`Uploading ${exercise.slug}...`)

    const buffer = await downloadGif(exercise.gifPath)
    const upload = await uploadCatalogMedia(buffer, 'image/gif', exercise.slug)

    await prisma.exerciseCatalog.update({
      where: { slug: exercise.slug },
      data: {
        mediaUrl: upload.mediaUrl,
        mediaType: upload.mediaType,
        descriptionEs: exercise.descriptionEs,
        descriptionEn: exercise.descriptionEn,
      },
    })

    results.push({
      slug: exercise.slug,
      mediaUrl: upload.mediaUrl,
      mediaType: upload.mediaType,
    })

    console.log(`  ✓ ${upload.mediaUrl}`)
  }

  console.log('\nDone. Uploaded media for', results.length, 'exercises.')
}

seedCatalogMedia()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
