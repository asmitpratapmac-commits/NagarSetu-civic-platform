import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  Clock,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    title: 'Report the issue',
    description: 'Snap a photo, drop a pin on the map, and describe what you saw. Takes under a minute.',
  },
  {
    title: 'AI routes it instantly',
    description: 'NagarSetu reads the report, sets a severity and deadline, and sends it straight to the right department.',
  },
  {
    title: 'Track it to resolution',
    description: 'Watch status updates in real time, and confirm the fix yourself before the case closes.',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-powered triage',
    description: 'Every report is classified, prioritized, and matched to a department the moment it lands — no manual sorting queue.',
  },
  {
    icon: Clock,
    title: 'SLA deadlines that mean something',
    description: 'Critical issues get 24 hours. Everything else follows a clear, published timeline — and escalates automatically if it slips.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified resolution',
    description: 'Officers upload before/after evidence, and citizens confirm the fix. No case closes on paperwork alone.',
  },
  {
    icon: BarChart3,
    title: 'Open city analytics',
    description: 'Hotspot maps and department performance are visible to everyone — not locked away in an internal report.',
  },
];

const STATS = [
  { value: '18,400+', label: 'Issues reported' },
  { value: '92%', label: 'Resolved within SLA' },
  { value: '4.2 days', label: 'Average resolution time' },
  { value: '31', label: 'City departments connected' },
];

export const LandingPage = () => {
  return (
    <div>
      {/* -------- Hero -------- */}
      <section className="container-page grid grid-cols-1 gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
            Connecting Citizens. Improving Cities.
          </p>
          <h1 className="mt-5 max-w-lg font-display text-4xl font-medium leading-tight text-char-950 sm:text-5xl">
            Report. Resolve. Improve your city.
          </h1>
          <p className="mt-5 max-w-md text-base text-stone-600">
            NagarSetu AI turns a phone photo into a tracked civic case — classified by AI, routed to the right
            department, and closed only when you say the problem is actually fixed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              Report an Issue
            </Link>
            <a href="#city-map" className="btn-outline">
              Explore City
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {STATS.slice(0, 2).map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-medium text-char-950">{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5">
            <p className="text-sm font-medium text-char-900">Live complaint feed</p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Real-time
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              { title: 'Streetlight outage, MG Road', status: 'In Progress', severity: 'High' },
              { title: 'Garbage overflow, Sector 21', status: 'Resolved', severity: 'Medium' },
              { title: 'Pothole near school gate', status: 'Assigned', severity: 'Critical' },
              { title: 'Water leakage, 4th Cross', status: 'Pending Verification', severity: 'High' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="flex-shrink-0 text-stone-400" />
                  <p className="text-sm text-char-800">{item.title}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.status === 'Resolved'
                      ? 'bg-emerald-500 text-white'
                      : item.status === 'Pending Verification'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-100 text-amber-500'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* -------- Stats strip -------- */}
      <section className="border-y border-stone-200 bg-char-950">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl font-medium text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- How it works -------- */}
      <section id="how-it-works" className="container-page py-20">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-medium text-char-950">How NagarSetu works</h2>
          <p className="mt-3 text-stone-600">Three steps between a problem you see and a city that fixes it.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card p-6">
              <p className="font-display text-2xl text-emerald-600">{i + 1}</p>
              <h3 className="mt-3 font-medium text-char-950">{step.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- Features -------- */}
      <section className="bg-stone-50 py-20">
        <div className="container-page">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl font-medium text-char-950">AI-powered civic intelligence</h2>
            <p className="mt-3 text-stone-600">
              Every report gets read, understood, and routed the moment it's submitted — by the same system
              that watches for duplicates, hotspots, and deadlines slipping.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card flex gap-4 p-6">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-char-950">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-stone-600">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------- City map teaser -------- */}
      <section id="city-map" className="container-page py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-medium text-char-950">See what's happening near you</h2>
            <p className="mt-3 max-w-md text-stone-600">
              Every public complaint is plotted on an open map — colored by severity, updated in real time, and
              searchable by category. No login required to look.
            </p>
            <Link to="/register" className="btn-primary mt-6 inline-flex">
              Explore the city map
            </Link>
          </div>
          <div className="card flex h-72 items-center justify-center bg-char-950 text-stone-400">
            <div className="text-center">
              <MapPin size={28} className="mx-auto text-mint-200" />
              <p className="mt-2 text-sm">Live map preview — sign in to explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------- Before/After verification -------- */}
      <section className="bg-stone-50 py-20">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
            <div className="card aspect-square overflow-hidden bg-stone-200" />
            <div className="card aspect-square overflow-hidden bg-emerald-100" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-3xl font-medium text-char-950">Transparent resolution, not just a status change</h2>
            <p className="mt-3 max-w-md text-stone-600">
              Officers upload before-and-after evidence when they mark a case resolved. You confirm it's actually
              fixed — and if it's not, the case reopens automatically.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-char-800">
              {['Evidence required before closing a case', 'Citizen confirmation built into the workflow', 'Reopened cases escalate to the same officer'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* -------- Analytics teaser -------- */}
      <section id="analytics" className="container-page py-20">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-medium text-char-950">Analytics the public can see</h2>
          <p className="mt-3 text-stone-600">Department performance, category trends, and resolution rates — public by default.</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="font-display text-xl font-medium text-char-950">{s.value}</p>
              <p className="mt-1 text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- Final CTA -------- */}
      <section className="container-page pb-24">
        <div className="card flex flex-col items-start gap-5 bg-char-950 p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-medium text-white sm:text-3xl">Something needs fixing near you?</h2>
            <p className="mt-2 text-stone-400">It takes under a minute to report, and you'll be able to track it the whole way.</p>
          </div>
          <Link to="/register" className="btn-primary flex-shrink-0">
            Report an Issue <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};
