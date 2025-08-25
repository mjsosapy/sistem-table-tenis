const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanInconsistentData() {
  try {
    console.log('=== LIMPIEZA DE DATOS INCONSISTENTES ===\n');
    
    // 1. Verificar estado actual
    console.log('1. ESTADO ACTUAL:');
    
    const tournaments = await prisma.tournament.findMany();
    console.log(`   - Torneos: ${tournaments.length}`);
    
    const playersWithPoints = await prisma.player.findMany({
      where: { puntos: { gt: 0 } }
    });
    console.log(`   - Jugadores con puntos: ${playersWithPoints.length}`);
    
    const tournamentResults = await prisma.tournamentResult.findMany();
    console.log(`   - Resultados de torneos: ${tournamentResults.length}`);
    
    // 2. Mostrar jugadores con puntos
    if (playersWithPoints.length > 0) {
      console.log('\n2. JUGADORES CON PUNTOS:');
      playersWithPoints.forEach(player => {
        console.log(`   - ${player.nombre}: ${player.puntos} puntos`);
      });
    }
    
    // 3. Mostrar resultados de torneos
    if (tournamentResults.length > 0) {
      console.log('\n3. RESULTADOS DE TORNEOS:');
      tournamentResults.forEach(result => {
        console.log(`   - Torneo ${result.torneoId}: Jugador ${result.jugadorId} - ${result.puntosGanados} puntos`);
      });
    }
    
    // 4. Análisis de inconsistencias
    console.log('\n4. ANÁLISIS:');
    
    if (tournaments.length === 0 && playersWithPoints.length > 0) {
      console.log('❌ PROBLEMA: No hay torneos pero hay jugadores con puntos');
      console.log('🔧 SOLUCIÓN: Limpiar puntos de jugadores');
      
      // 5. Limpiar puntos de jugadores
      console.log('\n5. LIMPIANDO PUNTOS DE JUGADORES...');
      const updateResult = await prisma.player.updateMany({
        where: { puntos: { gt: 0 } },
        data: { puntos: 0 }
      });
      console.log(`   ✅ Puntos limpiados de ${updateResult.count} jugadores`);
      
    } else if (tournamentResults.length > 0 && tournaments.length === 0) {
      console.log('❌ PROBLEMA: Hay resultados de torneos pero no hay torneos');
      console.log('🔧 SOLUCIÓN: Eliminar resultados huérfanos');
      
      // 5. Eliminar resultados huérfanos
      console.log('\n5. ELIMINANDO RESULTADOS HUÉRFANOS...');
      const deleteResult = await prisma.tournamentResult.deleteMany({});
      console.log(`   ✅ Eliminados ${deleteResult.count} resultados huérfanos`);
      
    } else if (tournaments.length > 0) {
      console.log('✅ Hay torneos, verificando consistencia...');
      
      // Verificar si hay resultados sin torneo
      const orphanResults = await prisma.tournamentResult.findMany({
        where: {
          torneoId: {
            notIn: tournaments.map(t => t.id)
          }
        }
      });
      
      if (orphanResults.length > 0) {
        console.log(`❌ PROBLEMA: ${orphanResults.length} resultados sin torneo`);
        console.log('🔧 SOLUCIÓN: Eliminar resultados huérfanos');
        
        const deleteResult = await prisma.tournamentResult.deleteMany({
          where: {
            torneoId: {
              notIn: tournaments.map(t => t.id)
            }
          }
        });
        console.log(`   ✅ Eliminados ${deleteResult.count} resultados huérfanos`);
      } else {
        console.log('✅ Todos los resultados tienen torneo válido');
      }
      
    } else {
      console.log('✅ Estado limpio: No hay torneos ni puntos');
    }
    
    // 6. Estado final
    console.log('\n6. ESTADO FINAL:');
    
    const finalTournaments = await prisma.tournament.findMany();
    console.log(`   - Torneos: ${finalTournaments.length}`);
    
    const finalPlayersWithPoints = await prisma.player.findMany({
      where: { puntos: { gt: 0 } }
    });
    console.log(`   - Jugadores con puntos: ${finalPlayersWithPoints.length}`);
    
    const finalTournamentResults = await prisma.tournamentResult.findMany();
    console.log(`   - Resultados de torneos: ${finalTournamentResults.length}`);
    
    console.log('\n✅ LIMPIEZA COMPLETADA');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanInconsistentData();
