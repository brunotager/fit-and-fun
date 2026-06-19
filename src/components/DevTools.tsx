'use client';

import React, { useState } from 'react';
import { useFitFun, BADGES } from '@/context/FitFunContext';
import { shopItems } from '@/data/shopItems';

/**
 * DevTools Panel — only renders in development mode (localhost).
 * Provides instant controls for testing points, shop items, badges, etc.
 * This component is completely stripped from production builds.
 */
export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [pointsInput, setPointsInput] = useState('');
  const [streakInput, setStreakInput] = useState('');

  const {
    progress,
    availablePoints,
    wardrobe,
    updateProgressState,
    purchaseItem,
    equipItem,
    unequipItem,
  } = useFitFun();

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  // --- Actions ---

  const handleSetPoints = () => {
    const pts = parseInt(pointsInput);
    if (isNaN(pts) || pts < 0) return;
    // Set totalPoints to desired amount + whatever was already spent
    updateProgressState({
      totalPoints: pts + (progress.totalPointsSpent || 0),
    });
    setPointsInput('');
  };

  const handleAddPoints = (amount: number) => {
    updateProgressState({
      totalPoints: progress.totalPoints + amount,
    });
  };

  const handleSetStreak = () => {
    const s = parseInt(streakInput);
    if (isNaN(s) || s < 0) return;
    updateProgressState({ currentStreak: s });
    setStreakInput('');
  };

  const handleUnlockAllItems = () => {
    const allIds = shopItems.map(i => i.id);
    // We need to give enough points first, then purchase each
    const totalCost = shopItems
      .filter(i => !wardrobe.ownedItems.includes(i.id))
      .reduce((sum, i) => sum + i.price, 0);

    if (availablePoints < totalCost) {
      updateProgressState({
        totalPoints: progress.totalPoints + (totalCost - availablePoints),
      });
    }

    // Small delay to let state update, then purchase each
    setTimeout(() => {
      allIds.forEach(id => {
        if (!wardrobe.ownedItems.includes(id)) {
          purchaseItem(id);
        }
      });
    }, 50);
  };

  const handleResetShop = () => {
    // Reset wardrobe and refund all spent points
    updateProgressState({
      totalPointsSpent: 0,
    });
    // We need to directly manipulate localStorage for wardrobe reset
    // since there's no "resetWardrobe" in context — we'll clear and reload
    localStorage.setItem('fitfun_wardrobe', JSON.stringify({
      ownedItems: [],
      equipped: { jersey: null, shoes: null, accessory: null },
    }));
    window.location.reload();
  };

  const handleGrantAllBadges = () => {
    const allBadgeIds = BADGES.map(b => b.id);
    updateProgressState({ badges: allBadgeIds });
  };

  const handleClearBadges = () => {
    updateProgressState({ badges: [] });
  };

  const handleSimulateWorkout = () => {
    // Give points + increment workouts + advance plan day (matches real completeWorkout logic)
    const points = 50;
    const today = new Date().toISOString().split('T')[0];
    updateProgressState({
      totalPoints: progress.totalPoints + points,
      workoutsCompleted: progress.workoutsCompleted + 1,
      currentPlanDay: progress.currentPlanDay + 1,
      lastWorkoutDate: today,
      currentStreak: progress.lastWorkoutDate === today
        ? progress.currentStreak
        : progress.currentStreak + 1,
    });
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL dev state? (points, shop, badges, streak)')) {
      updateProgressState({
        totalPoints: 0,
        totalPointsSpent: 0,
        workoutsCompleted: 0,
        currentStreak: 0,
        lastWorkoutDate: null,
        badges: [],
      });
      localStorage.setItem('fitfun_wardrobe', JSON.stringify({
        ownedItems: [],
        equipped: { jersey: null, shoes: null, accessory: null },
      }));
      window.location.reload();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '12px',
          zIndex: 9999,
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          border: 'none',
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
        }}
        title="Dev Tools"
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '130px',
            left: '12px',
            zIndex: 9998,
            width: '280px',
            maxHeight: '70vh',
            overflowY: 'auto',
            background: 'rgba(15, 15, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            color: '#e5e5e5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            padding: '0',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '14px' }}>🛠</span>
            <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>
              DEV TOOLS
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '9px',
              background: '#22c55e',
              color: '#000',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
            }}>
              LOCAL ONLY
            </span>
          </div>

          {/* Current State Summary */}
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
          }}>
            <StatBox label="Available" value={availablePoints} color="#f97316" />
            <StatBox label="Lifetime" value={progress.totalPoints} color="#a78bfa" />
            <StatBox label="Spent" value={progress.totalPointsSpent || 0} color="#f87171" />
            <StatBox label="Day" value={progress.currentPlanDay} color="#818cf8" />
            <StatBox label="Streak" value={progress.currentStreak} color="#34d399" />
            <StatBox label="Workouts" value={progress.workoutsCompleted} color="#60a5fa" />
            <StatBox label="Badges" value={progress.badges.length} color="#fbbf24" />
          </div>

          {/* Points Section */}
          <Section title="💰 Points">
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <input
                type="number"
                placeholder="Set available pts…"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetPoints()}
                style={inputStyle}
              />
              <button onClick={handleSetPoints} style={btnStyle('#6366f1')}>Set</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button onClick={() => handleAddPoints(100)} style={btnStyle('#22c55e')}>+100</button>
              <button onClick={() => handleAddPoints(500)} style={btnStyle('#22c55e')}>+500</button>
              <button onClick={() => handleAddPoints(1000)} style={btnStyle('#22c55e')}>+1K</button>
              <button onClick={() => handleAddPoints(5000)} style={btnStyle('#22c55e')}>+5K</button>
            </div>
          </Section>

          {/* Shop Section */}
          <Section title="🛍 Shop">
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button onClick={handleUnlockAllItems} style={btnStyle('#8b5cf6')}>
                🔓 Unlock All
              </button>
              <button onClick={handleResetShop} style={btnStyle('#ef4444')}>
                🔄 Reset Shop
              </button>
            </div>
            <div style={{ marginTop: '6px', fontSize: '10px', color: '#888' }}>
              Owned: {wardrobe.ownedItems.length}/{shopItems.length} •
              Equipped: {wardrobe.equipped.jersey || 'none'}
            </div>
          </Section>

          {/* Workout Section */}
          <Section title="⚡ Workout">
            <button onClick={handleSimulateWorkout} style={{ ...btnStyle('#f97316'), width: '100%' }}>
              Simulate Workout (+50 pts, +1 day)
            </button>
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <input
                type="number"
                placeholder="Set streak…"
                value={streakInput}
                onChange={(e) => setStreakInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetStreak()}
                style={inputStyle}
              />
              <button onClick={handleSetStreak} style={btnStyle('#6366f1')}>Set</button>
            </div>
          </Section>

          {/* Badges Section */}
          <Section title="🏅 Badges">
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={handleGrantAllBadges} style={btnStyle('#fbbf24')}>
                Grant All
              </button>
              <button onClick={handleClearBadges} style={btnStyle('#ef4444')}>
                Clear All
              </button>
            </div>
          </Section>

          {/* Danger Zone */}
          <div style={{
            padding: '10px 16px 14px',
            borderTop: '1px solid rgba(239,68,68,0.2)',
          }}>
            <button
              onClick={handleResetAll}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.1)',
                color: '#f87171',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑 Reset Everything
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// --- Sub-components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '10px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '8px',
      padding: '6px 8px',
    }}>
      <div style={{ fontSize: '9px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// --- Shared styles ---

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#e5e5e5',
  fontSize: '12px',
  outline: 'none',
  minWidth: 0,
};

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    background: bg,
    color: '#fff',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}
