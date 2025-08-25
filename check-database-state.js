const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('=== ESTADO ACTUAL DE LA BASE DE DATOS ===\n');
    
    // 1. Verificar jugadores
    console.log('1. JUGADORES:');
    const players = await prisma.player.findMany({
      select: { id: true, nombre: true, puntos: true, role: true }
    });
    console.log(`Total jugadores: ${players.length}`);
    players.forEach(p => {
      console.log(`  - ${p.nombre} (${p.role}): ${p.puntos} puntos`);
    });
    
    // 2. Verificar torneos
    console.log('\n2. TORNEOS:');
    const tournaments = await prisma.tournament.findMany({
      select: { id: true, nombre: true, estado: true, tipo: true }
    });
    console.log(`Total torneos: ${tournaments.length}`);
    tournaments.forEach(t => {
      console.log(`  - ${t.nombre} (${t.estado}): ${t.tipo}`);
    });
    
    // 3. Verificar resultados de torneos
    console.log('\n3. RESULTADOS DE TORNEOS:');
    const results = await prisma.tournamentResult.findMany({
      select: { id: true, jugadorId: true, torneoId: true, puntosGanados: true }
    });
    console.log(`Total resultados: ${results.length}`);
    results.forEach(r => {
      console.log(`  - Jugador ${r.jugadorId} en torneo ${r.torneoId}: ${r.puntosGanados} puntos`);
    });
    
    // 4. Verificar partidos
    console.log('\n4. PARTIDOS:');
    const matches = await prisma.match.findMany({
      select: { id: true, estado: true, torneoId: true }
    });
    console.log(`Total partidos: ${matches.length}`);
    const completedMatches = matches.filter(m => m.estado === 'Finalizado').length;
    console.log(`Partidos finalizados: ${completedMatches}`);
    
    console.log('\n=== ANÁLISIS ===');
    
    // Verificar inconsistencias
    const playersWithPoints = players.filter(p => p.puntos > 0);
    const playersWithRoleJugador = players.filter(p => p.role === 'Jugador');
    
    console.log(`Jugadores con puntos: ${playersWithPoints.length}`);
    console.log(`Jugadores con role 'Jugador': ${playersWithRoleJugador.length}`);
    
    if (playersWithPoints.length > 0 && tournaments.length === 0) {
      console.log('❌ PROBLEMA: Jugadores con puntos pero sin torneos');
    } else if (results.length > 0 && tournaments.length === 0) {
      console.log('❌ PROBLEMA: Resultados de torneos pero sin torneos');
    } else {
      console.log('✅ Estado consistente');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
