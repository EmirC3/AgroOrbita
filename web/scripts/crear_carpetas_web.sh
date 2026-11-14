#!/usr/bin/env bash
# Crea las carpetas por feature dentro de web/src (ejecutar DESPUÉS de create-next-app).
set -e
cd "$(dirname "$0")/../web/src"

for f in zona recomendacion rotaciones auth parcelas cosechas verdor; do
  mkdir -p "features/$f"/{components,hooks,services,validations,types}
done
mkdir -p features/asistente/{components,hooks,services,validations,types}

mkdir -p components/{ui,layouts,common}
mkdir -p lib/{db,supabase,datos}
mkdir -p stores hooks constants types
mkdir -p app/api/{parcelas,cosechas,asistente}
mkdir -p ../public/{data,icons}
mkdir -p ../tests/{unit,e2e}
mkdir -p ../supabase

find features components lib stores hooks constants types -type d -empty -exec touch {}/.gitkeep \;
echo "Carpetas de web/ creadas."
