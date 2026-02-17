'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// SLIDE COMPONENTS
// ============================================================================

function TitleSlide() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-pizza-bg" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        }}
      />
      {/* Accent orbs */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{
          background: '#3b82f6',
          top: '10%',
          right: '10%',
        }}
      />
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-8"
        style={{
          background: '#8b5cf6',
          bottom: '10%',
          left: '5%',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 animate-fade-in">
        {/* Logo/Icon */}
        <div className="mb-8">
          <PizzaSliceIcon className="w-20 h-20" />
        </div>
        
        {/* Main title */}
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight mb-4"
            style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
          Pizza Slice 🍕
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl lg:text-3xl text-pizza-text-secondary tracking-wide mb-12">
          Parallel Order Execution for Monad
        </p>
        
        {/* Divider */}
        <div className="w-32 h-0.5 bg-gradient-to-r from-pizza-accent to-pizza-accent-secondary rounded-full mb-10" />
        
        {/* Event badge */}
        <div className="px-6 py-3 rounded-full border border-pizza-accent/30 bg-pizza-accent/10 backdrop-blur-sm">
          <span className="text-sm font-semibold uppercase tracking-widest text-pizza-accent">
            MONAD BLITZ HACKATHON 2026
          </span>
        </div>
        
        {/* Team credit */}
        <p className="absolute bottom-12 text-pizza-text-tertiary text-sm">
          Built by DecentralBros
        </p>
      </div>
    </div>
  )
}

function ProblemSlide() {
  const problems = [
    {
      icon: <TrendingDownIcon className="w-6 h-6 text-red-500" />,
      title: 'Massive Slippage',
      description: 'Large on-chain orders move markets against you. A $100K swap can lose 2-5% to price impact alone.',
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-red-500" />,
      title: 'Sequential Execution',
      description: "Traditional EVMs process transactions one-by-one. Your 20-slice order waits in a single-file line.",
    },
    {
      icon: <EyeIcon className="w-6 h-6 text-red-500" />,
      title: 'MEV Predators',
      description: 'Searchers detect large orders in the mempool and front-run them, extracting value before your trade executes.',
    },
  ]

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-pizza-bg" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)',
        }}
      />
      
      {/* Left content - 60% */}
      <div className="relative z-10 w-3/5 flex flex-col justify-center pl-16 pr-8 animate-slide-up">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-medium uppercase tracking-widest text-red-500">
            THE CHALLENGE
          </span>
        </div>
        
        {/* Header */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-12">
          Large Orders Are Broken
        </h2>
        
        {/* Problem cards */}
        <div className="space-y-6">
          {problems.map((problem, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                {problem.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {problem.title}
                </h3>
                <p className="text-base text-pizza-text-secondary max-w-md">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right visual - 40% */}
      <div className="relative z-10 w-2/5 flex items-center justify-center pr-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Traditional EVM */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-pizza-text-secondary">
              <ClockIcon className="w-4 h-4" />
              <span>Traditional EVM</span>
            </div>
            <div className="relative h-16 bg-pizza-bg-secondary rounded-xl border border-pizza-text-tertiary/20 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-10 h-10 rounded bg-red-500/80 border-2 border-red-400 animate-pulse flex items-center justify-center text-xs font-mono text-white">BIG</div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-center gap-1">
                <div className="w-4 h-4 rounded bg-pizza-text-tertiary/30" />
                <div className="w-4 h-4 rounded bg-pizza-text-tertiary/30" />
                <div className="w-4 h-4 rounded bg-pizza-text-tertiary/30" />
                <span className="text-pizza-text-tertiary text-xs ml-1">waiting...</span>
              </div>
            </div>
            <p className="text-xs text-red-400 text-center">One at a time ⏳</p>
          </div>
          
          {/* Monad + Pizza Slice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-pizza-success">
              <ZapIcon className="w-4 h-4" />
              <span>Monad + Pizza Slice</span>
            </div>
            <div className="space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="h-8 bg-pizza-bg-secondary rounded-lg border border-pizza-accent/20 flex items-center px-3 gap-2"
                >
                  <div 
                    className="w-5 h-5 rounded bg-gradient-to-r from-pizza-accent to-pizza-accent-secondary animate-pulse"
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                  <div className="flex-1 h-1.5 bg-pizza-accent/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pizza-accent to-pizza-accent-secondary rounded-full"
                      style={{ width: '100%', animation: 'slideRight 1s ease-out infinite', animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-pizza-success text-center">Parallel execution ⚡</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SolutionSlide() {
  const features = [
    {
      num: '1',
      color: '#3b82f6',
      icon: <ScissorsIcon className="w-10 h-10 text-pizza-accent" />,
      title: 'Slice It',
      description: 'Break large orders into optimally-weighted slices using VWAP pattern. Our algorithm distributes volume as 150% / 100% / 50% weights, mimicking real market depth.',
      detail: 'weights = [1.5, 1.0, 0.5, ...]',
    },
    {
      num: '2',
      color: '#8b5cf6',
      icon: <LayersIcon className="w-10 h-10 text-pizza-accent-secondary" />,
      title: 'Parallelize It',
      description: "Execute all slices simultaneously using Monad's parallel EVM. What takes 20 blocks on Ethereum happens in 1 block on Monad.",
      detail: '20 tx → 1 block',
    },
    {
      num: '3',
      color: '#10b981',
      icon: <ShieldIcon className="w-10 h-10 text-pizza-success" />,
      title: 'Trustless Execution',
      description: 'Anyone can execute slices—keepers, bots, or users. A bitmask prevents double-execution with O(1) gas cost.',
      detail: 'executedMask |= (1 << idx)',
    },
  ]

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-pizza-bg" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
        }}
      />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-pizza-success" />
            <span className="text-xs font-medium uppercase tracking-widest text-pizza-success">
              THE SOLUTION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Pizza Slice: Parallel VWAP Execution
          </h2>
          <p className="text-lg text-pizza-text-secondary">
            Break it down. Speed it up. Execute trustlessly.
          </p>
        </div>
        
        {/* Feature cards */}
        <div className="flex gap-6 mb-10">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="w-80 bg-pizza-bg-secondary/60 backdrop-blur-sm border border-pizza-text-tertiary/10 rounded-2xl p-8 hover:border-pizza-accent/30 hover:scale-[1.02] transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4"
                style={{ backgroundColor: feature.color }}
              >
                {feature.num}
              </div>
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-pizza-text-secondary mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="px-3 py-2 bg-black/30 rounded-lg">
                <code className="text-xs font-mono text-pizza-text-tertiary">
                  {feature.detail}
                </code>
              </div>
            </div>
          ))}
        </div>
        
        {/* Callout */}
        <div className="w-full max-w-3xl px-12 py-6 rounded-xl bg-gradient-to-r from-pizza-accent/10 to-pizza-accent-secondary/10 border border-pizza-accent/20">
          <p className="text-xl md:text-2xl font-semibold text-white text-center">
            &ldquo;20 slices. Parallel execution. Zero double-spend risk.&rdquo;
          </p>
        </div>
        
        {/* Tech stack */}
        <div className="flex items-center gap-3 mt-8">
          {['Monad', 'Solidity ^0.8.28', 'Hardhat', 'Mini-App', 'Vercel'].map((tech, idx) => (
            <span 
              key={idx}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-pizza-text-secondary"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function DemoSlide() {
  const steps = [
    {
      num: '01',
      icon: <PlusCircleIcon className="w-6 h-6 text-pizza-accent" />,
      title: 'Create Order',
      description: 'Enter total amount and number of slices (1-20). Smart contract pre-calculates VWAP weights.',
    },
    {
      num: '02',
      icon: <ZapIcon className="w-6 h-6 text-pizza-accent-secondary" />,
      title: 'Execute Slices',
      description: 'Click individual slices or batch-execute. Watch parallel transactions fire simultaneously.',
    },
    {
      num: '03',
      icon: <BarChartIcon className="w-6 h-6 text-pizza-success" />,
      title: 'Real-Time Visualization',
      description: 'See slice status update live. Bitmask visualization shows execution progress.',
    },
  ]

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-pizza-bg" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        }}
      />
      
      {/* Left - QR Code 45% */}
      <div className="relative z-10 w-[45%] flex flex-col items-center justify-center animate-fade-in">
        <div className="flex items-center gap-2 mb-6 animate-bounce-subtle">
          <ChevronDownIcon className="w-4 h-4 text-pizza-accent" />
          <span className="text-sm font-semibold uppercase tracking-widest text-pizza-accent">
            Scan to Launch
          </span>
          <ChevronDownIcon className="w-4 h-4 text-pizza-accent" />
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* QR Code placeholder - you can generate actual QR */}
          <div className="w-56 h-56 bg-pizza-bg rounded-2xl flex items-center justify-center relative">
            <div className="grid grid-cols-8 gap-1 p-4">
              {Array.from({ length: 64 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-5 h-5 rounded-sm ${
                    Math.random() > 0.5 ? 'bg-pizza-bg' : 'bg-white'
                  }`}
                  style={{ backgroundColor: Math.random() > 0.5 ? '#0a0e1a' : 'white' }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍕</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-pizza-text-tertiary" />
          <code className="text-sm font-mono text-pizza-text-tertiary">
            pizza-slice.vercel.app
          </code>
        </div>
      </div>
      
      {/* Right - Demo info 55% */}
      <div className="relative z-10 w-[55%] flex flex-col justify-center pr-16 animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-pizza-success animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest text-pizza-success">
              LIVE DEMO
            </span>
          </div>
          <h2 className="text-5xl font-bold text-white">
            Try It Now
          </h2>
        </div>
        
        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <span className="absolute -left-8 top-0 text-4xl font-black text-pizza-bg-secondary opacity-50">
                {step.num}
              </span>
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-pizza-bg-secondary border border-pizza-text-tertiary/20 flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-pizza-text-secondary max-w-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Presenter note */}
        <div className="mt-10 px-4 py-3 rounded-lg border border-dashed border-pizza-warning/30 bg-pizza-warning/10 max-w-sm">
          <p className="text-xs text-pizza-warning">
            📍 Presenter: Demo live app here
          </p>
        </div>
      </div>
    </div>
  )
}

function QASlide() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background - match title slide */}
      <div className="absolute inset-0 bg-pizza-bg" />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: '#3b82f6', top: '10%', right: '10%' }}
      />
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-8"
        style={{ background: '#8b5cf6', bottom: '10%', left: '5%' }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
        <h1 
          className="text-8xl md:text-9xl font-black text-white tracking-wider mb-6"
          style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
        >
          Q&A
        </h1>
        
        <p className="text-2xl md:text-3xl text-pizza-text-secondary mb-12">
          Let&apos;s slice into it 🍕
        </p>
        
        <div className="w-20 h-0.5 bg-gradient-to-r from-pizza-accent to-pizza-accent-secondary rounded-full" />
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-16 text-sm">
        <div className="flex items-center gap-2">
          <GithubIcon className="w-5 h-5 text-pizza-text-secondary" />
          <span className="font-mono text-pizza-text-tertiary">
            github.com/Mr-Web3/monad-hackathon-build
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">🍕</span>
          <span className="font-semibold text-pizza-text-secondary">
            DecentralBros
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <TwitterIcon className="w-5 h-5 text-pizza-text-secondary" />
          <span className="text-pizza-text-tertiary">
            @DecentralBros_
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ICONS
// ============================================================================

function PizzaSliceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nodes */}
      <circle cx="40" cy="15" r="6" fill="url(#gradient1)" />
      <circle cx="20" cy="45" r="5" fill="url(#gradient1)" />
      <circle cx="60" cy="45" r="5" fill="url(#gradient1)" />
      <circle cx="30" cy="65" r="4" fill="url(#gradient1)" />
      <circle cx="50" cy="65" r="4" fill="url(#gradient1)" />
      <circle cx="40" cy="40" r="4" fill="url(#gradient1)" />
      {/* Lines */}
      <line x1="40" y1="15" x2="20" y2="45" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="40" y1="15" x2="60" y2="45" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="20" y1="45" x2="30" y2="65" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="60" y1="45" x2="50" y2="65" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="30" y1="65" x2="50" y2="65" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="40" y1="40" x2="40" y2="15" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="40" y1="40" x2="20" y2="45" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="40" y1="40" x2="60" y2="45" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

// ============================================================================
// MAIN PRESENTATION COMPONENT
// ============================================================================

const slides = [
  { id: 'title', component: TitleSlide },
  { id: 'problem', component: ProblemSlide },
  { id: 'solution', component: SolutionSlide },
  { id: 'demo', component: DemoSlide },
  { id: 'qa', component: QASlide },
]

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
    }
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        prevSlide()
      } else if (e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        goToSlide(parseInt(e.key) - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, goToSlide])

  const CurrentSlideComponent = slides[currentSlide].component

  return (
    <div className="w-screen h-screen overflow-hidden bg-pizza-bg">
      {/* Slide container */}
      <div className="w-full h-full">
        <CurrentSlideComponent />
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        {/* Slide indicators */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pizza-bg-secondary/80 backdrop-blur-sm border border-pizza-text-tertiary/20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                idx === currentSlide
                  ? 'bg-pizza-accent w-6'
                  : 'bg-pizza-text-tertiary/50 hover:bg-pizza-text-secondary'
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="px-3 py-1.5 rounded-lg bg-pizza-bg-secondary/80 backdrop-blur-sm border border-pizza-text-tertiary/20">
          <span className="text-sm font-mono text-pizza-text-secondary">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Click zones for navigation */}
      <button
        onClick={prevSlide}
        className="fixed left-0 top-0 w-1/4 h-full cursor-w-resize z-40 opacity-0 hover:opacity-100 transition-opacity"
        disabled={currentSlide === 0}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pizza-bg-secondary/50 backdrop-blur-sm">
          <svg className="w-6 h-6 text-pizza-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
      </button>
      <button
        onClick={nextSlide}
        className="fixed right-0 top-0 w-1/4 h-full cursor-e-resize z-40 opacity-0 hover:opacity-100 transition-opacity"
        disabled={currentSlide === slides.length - 1}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pizza-bg-secondary/50 backdrop-blur-sm">
          <svg className="w-6 h-6 text-pizza-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>

      {/* Keyboard hints */}
      <div className="fixed bottom-6 right-6 text-xs text-pizza-text-tertiary/50 z-50">
        ← → or 1-5 to navigate
      </div>
    </div>
  )
}
