import { useState, useCallback } from 'react';
import { ArrowRight, RefreshCw, Sparkles, Wand2, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { CanvasWatchPreview } from '@/components/CanvasWatchPreview';
import { QRDisplay } from '@/components/QRDisplay';
import { StepIndicator } from '@/components/StepIndicator';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ElementList } from '@/components/ElementList';

import { useApp, actions } from '@/context/AppContext';
import { buildZPK } from '@/lib/zpkBuilder';
import { uploadZPKWithQR } from '@/lib/githubApi';
import { generateQRCode } from '@/lib/qrGenerator';
import { analyzeWatchfaceImage, testApiKey, type AIProvider, type AIServiceConfig } from '@/lib/aiService';
import { expandAnalysisToElements } from '@/lib/assetGenerator';
import { runPipeline } from '@/pipeline';
import { extractElementsFromImage, type PipelineAIProvider } from '@/pipeline/pipelineAIService';
import { generatePipelineAssets } from '@/pipeline/assetImageGenerator';
import type { WatchFaceConfig, WatchFaceElement, ElementImage } from '@/types';
import { generateId } from '@/lib/utils';

// Mock Kimi analysis - simulates AI analysis
async function mockKimiAnalysis(
  _backgroundImage: string,
  _fullDesignImage: string,
  watchModel: string
): Promise<{ config: WatchFaceConfig; elementImages: ElementImage[] }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Parse watch model for resolution
  const resolutions: Record<string, { width: number; height: number }> = {
    // User's main goal
    'Balance 2': { width: 480, height: 480 },
    // Other requested models
    'Balance': { width: 480, height: 480 },
    'Active Max': { width: 480, height: 480 },
    'Active 3 Premium': { width: 466, height: 466 },
    'Active 2 Round': { width: 466, height: 466 },
    'Active 2 Square': { width: 390, height: 450 },
    'Active': { width: 390, height: 450 },
    'Pop 3S (PIB)': { width: 410, height: 502 },
    // Original models
    'GTR4': { width: 466, height: 466 },
    'GTS4': { width: 390, height: 450 },
    'Cheetah Pro': { width: 466, height: 466 },
    'T-Rex 2': { width: 454, height: 454 },
    'Falcon': { width: 416, height: 416 },
  };

  const resolution = resolutions[watchModel] || { width: 466, height: 466 };

  // Generate mock elements - ALL widget types for Balance 2 V2 format
  // Covers every generator code path + all proven data_types from Zepp OS v1.0
  const cx = Math.floor(resolution.width / 2);
  const cy = Math.floor(resolution.height / 2);
  const elements: WatchFaceElement[] = [
    // ===== BACKGROUND =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Background',
      bounds: { x: 0, y: 0, width: resolution.width, height: resolution.height },
      src: 'background_ed15585c.png',
      visible: true,
      zIndex: 0,
    },
    // ===== TIME (IMG_TIME - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Time Display',
      bounds: { x: 25, y: 220, width: 150, height: 60 },
      src: 'time_digit_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== DATE (IMG_DATE day - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Date',
      bounds: { x: 92, y: 198, width: 40, height: 30 },
      src: 'date_digit_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== MONTH (IMG_DATE month - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Month',
      bounds: { x: 130, y: 198, width: 40, height: 30 },
      src: 'month_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== WEEKDAY (IMG_WEEK - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Weekday',
      bounds: { x: 33, y: 198, width: 20, height: 30 },
      src: 'week_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== ANALOG CLOCK HANDS (TIME_POINTER) =====
    {
      id: generateId(),
      type: 'TIME_POINTER',
      name: 'Analog Clock Hands',
      bounds: { x: cx - 40, y: cy - 40, width: 80, height: 80 },
      center: { x: cx, y: cy },
      hourHandSrc: 'hour_hand.png',
      minuteHandSrc: 'minute_hand.png',
      secondHandSrc: 'second_hand.png',
      coverSrc: 'hand_cover.png',
      hourPos: { x: 11, y: 70 },
      minutePos: { x: 8, y: 100 },
      secondPos: { x: 3, y: 120 },
      visible: true,
      zIndex: 15,
    },
    // ===== BATTERY ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Battery Arc',
      bounds: { x: cx - 80, y: 50, width: 160, height: 160 },
      center: { x: cx, y: 130 },
      radius: 70,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 8,
      color: '0x00CC88',
      dataType: 'BATTERY',
      visible: true,
      zIndex: 5,
    },
    // ===== BATTERY VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Battery Value',
      bounds: { x: cx - 25, y: 118, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `batt_digit_${i}.png`),
      dataType: 'BATTERY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== HEART RATE ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Heart Rate Arc',
      bounds: { x: 30, y: cy - 50, width: 100, height: 100 },
      center: { x: 80, y: cy },
      radius: 40,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 6,
      color: '0xFF6B6B',
      dataType: 'HEART',
      visible: true,
      zIndex: 5,
    },
    // ===== HEART RATE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Heart Rate Value',
      bounds: { x: 55, y: cy - 12, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `heart_digit_${i}.png`),
      dataType: 'HEART',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== STEPS ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Steps Arc',
      bounds: { x: resolution.width - 130, y: cy - 50, width: 100, height: 100 },
      center: { x: resolution.width - 80, y: cy },
      radius: 40,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 6,
      color: '0xFFD93D',
      dataType: 'STEP',
      visible: true,
      zIndex: 5,
    },
    // ===== STEPS VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Steps Value',
      bounds: { x: resolution.width - 105, y: cy - 12, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `step_digit_${i}.png`),
      dataType: 'STEP',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== CALORIES VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Calories Value',
      bounds: { x: 55, y: cy + 60, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `cal_digit_${i}.png`),
      dataType: 'CAL',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== DISTANCE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Distance Value',
      bounds: { x: resolution.width - 115, y: cy + 60, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `dist_digit_${i}.png`),
      dataType: 'DIST',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== PAI/BIO CHARGE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'PAI Value',
      bounds: { x: cx - 30, y: resolution.height - 80, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `pai_digit_${i}.png`),
      dataType: 'PAI_DAILY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== SPO2 VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'SpO2 Value',
      bounds: { x: cx - 30, y: 50, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `spo2_digit_${i}.png`),
      dataType: 'SPO2',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== HUMIDITY VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Humidity Value',
      bounds: { x: 30, y: resolution.height - 55, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `hum_digit_${i}.png`),
      dataType: 'HUMIDITY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== UVI VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'UV Index Value',
      bounds: { x: resolution.width - 80, y: resolution.height - 55, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `uvi_digit_${i}.png`),
      dataType: 'UVI',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== ACTIVITY ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Activity Arc',
      bounds: { x: cx - 55, y: resolution.height - 120, width: 110, height: 110 },
      center: { x: cx, y: resolution.height - 65 },
      radius: 50,
      startAngle: -120,
      endAngle: 120,
      lineWidth: 6,
      color: '0x6BCB77',
      dataType: 'STEP',
      visible: true,
      zIndex: 5,
    },
    // ===== WEATHER ICON (IMG_LEVEL) =====
    {
      id: generateId(),
      type: 'IMG_LEVEL',
      name: 'Weather Icon',
      bounds: { x: 60, y: resolution.height - 60, width: 40, height: 40 },
      images: Array.from({length: 29}, (_, i) => `weather_${i}.png`),
      dataType: 'WEATHER_CURRENT',
      visible: true,
      zIndex: 6,
    },
    // ===== BLUETOOTH STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'Bluetooth Status',
      bounds: { x: cx - 15, y: resolution.height - 60, width: 30, height: 30 },
      src: 'bluetooth_30x30.png',
      statusType: 'DISCONNECT',
      visible: true,
      zIndex: 6,
    },
    // ===== DND STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'DND Status',
      bounds: { x: cx + 20, y: resolution.height - 60, width: 30, height: 30 },
      src: 'dnd_30x30.png',
      statusType: 'DISTURB',
      visible: true,
      zIndex: 6,
    },
    // ===== ALARM STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'Alarm Status',
      bounds: { x: cx + 55, y: resolution.height - 60, width: 30, height: 30 },
      src: 'alarm_30x30.png',
      statusType: 'CLOCK',
      visible: true,
      zIndex: 6,
    },
    // ===== CITY NAME (TEXT) =====
    {
      id: generateId(),
      type: 'TEXT',
      name: 'City Name',
      bounds: { x: cx - 70, y: resolution.height - 35, width: 140, height: 25 },
      text: '',
      fontSize: 18,
      color: '0xCCCCCCFF',
      visible: true,
      zIndex: 6,
    },
    // ===== BATTERY DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Battery Ring Decor',
      bounds: { x: cx - 80, y: 48, width: 160, height: 160 },
      center: { x: cx, y: 130 },
      radius: 78,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== HEART DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Heart Ring Decor',
      bounds: { x: 28, y: cy - 52, width: 104, height: 104 },
      center: { x: 80, y: cy },
      radius: 48,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== STEPS DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Steps Ring Decor',
      bounds: { x: resolution.width - 132, y: cy - 52, width: 104, height: 104 },
      center: { x: resolution.width - 80, y: cy },
      radius: 48,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== HEART ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Heart Icon',
      bounds: { x: 68, y: cy - 35, width: 24, height: 20 },
      src: 'icon_heart_24x20.png',
      visible: true,
      zIndex: 7,
    },
    // ===== STEPS ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Steps Icon',
      bounds: { x: resolution.width - 92, y: cy - 35, width: 24, height: 24 },
      src: 'icon_steps_24x24.png',
      visible: true,
      zIndex: 7,
    },
    // ===== BATTERY ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Battery Icon Label',
      bounds: { x: cx - 12, y: 96, width: 24, height: 14 },
      src: 'icon_batt_24x14.png',
      visible: true,
      zIndex: 7,
    },
    // ===== BUTTON: Battery Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Battery Shortcut',
      bounds: { x: cx - 50, y: 60, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'Settings_batteryManagerScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Heart Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Heart Shortcut',
      bounds: { x: 30, y: cy - 50, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'heart_app_Screen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Steps/Activity Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Activity Shortcut',
      bounds: { x: resolution.width - 130, y: cy - 50, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'activityAppScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Weather Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Weather Shortcut',
      bounds: { x: 30, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'WeatherScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Stress Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Stress Shortcut',
      bounds: { x: resolution.width - 120, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'StressHomeScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: PAI/Bio Charge Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'PAI Shortcut',
      bounds: { x: cx - 45, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'BioChargeHomeScreen',
      visible: true,
      zIndex: 10,
    },
  ];

  // Generate mock element images - create proper watch hand/element graphics
  console.log('[Mock] Starting element image generation for', elements.length, 'elements');
  const elementImages: ElementImage[] = [];
  
  // Helper: create a canvas image and return as dataUrl
  function createCanvasImage(width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawFn(ctx, width, height);
    }
    return canvas.toDataURL('image/png');
  }
  
  // Helper: draw a digit on canvas
  function drawDigit(ctx: CanvasRenderingContext2D, w: number, h: number, digit: string, color: string) {
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(h * 0.7)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, w / 2, h / 2);
  }
  
  // Generate TIME digit images (0-9) - used by IMG_TIME for hours and minutes
  const timeDigitSize = { w: 30, h: 50 };
  for (let i = 0; i < 10; i++) {
    const filename = `time_digit_${i}.png`;
    const dataUrl = createCanvasImage(timeDigitSize.w, timeDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFFFFF');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: timeDigitSize.w, height: timeDigitSize.h },
      type: 'IMG',
    });
  }
  
  // Generate DATE digit images (0-9) - used by IMG_DATE for day numbers
  const dateDigitSize = { w: 20, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `date_digit_${i}.png`;
    const dataUrl = createCanvasImage(dateDigitSize.w, dateDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#CCCCCC');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: dateDigitSize.w, height: dateDigitSize.h },
      type: 'IMG',
    });
  }
  
  // Generate WEEK images (7 days) - used by IMG_WEEK
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const weekSize = { w: 40, h: 20 };
  for (let i = 0; i < 7; i++) {
    const filename = `week_${i}.png`;
    const dataUrl = createCanvasImage(weekSize.w, weekSize.h, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(weekDays[i], w / 2, h / 2);
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: weekSize.w, height: weekSize.h },
      type: 'IMG',
    });
  }
  
  // Generate BATTERY digit images (0-9) - used by TEXT_IMG for battery %
  const battDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `batt_digit_${i}.png`;
    const dataUrl = createCanvasImage(battDigitSize.w, battDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#00CC88');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: battDigitSize.w, height: battDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate HEART RATE digit images (0-9) - used by TEXT_IMG
  const heartDigitSize = { w: 18, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `heart_digit_${i}.png`;
    const dataUrl = createCanvasImage(heartDigitSize.w, heartDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FF6B6B');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: heartDigitSize.w, height: heartDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate STEPS digit images (0-9) - used by TEXT_IMG
  const stepDigitSize = { w: 18, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `step_digit_${i}.png`;
    const dataUrl = createCanvasImage(stepDigitSize.w, stepDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFD93D');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: stepDigitSize.w, height: stepDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate CALORIES digit images (0-9) - used by TEXT_IMG CAL
  const calDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `cal_digit_${i}.png`;
    const dataUrl = createCanvasImage(calDigitSize.w, calDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FF9F43');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: calDigitSize.w, height: calDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate DISTANCE digit images (0-9) - used by TEXT_IMG DIST
  const distDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `dist_digit_${i}.png`;
    const dataUrl = createCanvasImage(distDigitSize.w, distDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#54A0FF');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: distDigitSize.w, height: distDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate PAI digit images (0-9) - used by TEXT_IMG PAI_DAILY
  const paiDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `pai_digit_${i}.png`;
    const dataUrl = createCanvasImage(paiDigitSize.w, paiDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#5F27CD');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: paiDigitSize.w, height: paiDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate SPO2 digit images (0-9) - used by TEXT_IMG SPO2
  const spo2DigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `spo2_digit_${i}.png`;
    const dataUrl = createCanvasImage(spo2DigitSize.w, spo2DigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#EE5A24');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: spo2DigitSize.w, height: spo2DigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate HUMIDITY digit images (0-9) - used by TEXT_IMG HUMIDITY
  const humDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `hum_digit_${i}.png`;
    const dataUrl = createCanvasImage(humDigitSize.w, humDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#0ABDE3');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: humDigitSize.w, height: humDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate UVI digit images (0-9) - used by TEXT_IMG UVI
  const uviDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `uvi_digit_${i}.png`;
    const dataUrl = createCanvasImage(uviDigitSize.w, uviDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFC312');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: uviDigitSize.w, height: uviDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate MONTH images (0-11) - used by IMG_DATE month (12-image array)
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthSize = { w: 40, h: 20 };
  for (let i = 0; i < 12; i++) {
    const filename = `month_${i}.png`;
    const dataUrl = createCanvasImage(monthSize.w, monthSize.h, (ctx, w, h) => {
      ctx.fillStyle = '#AAAAAA';
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(monthNames[i], w / 2, h / 2);
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: monthSize.w, height: monthSize.h }, type: 'IMG' });
  }

  // Generate DND icon for IMG_STATUS (DISTURB)
  const dndSize = 30;
  const dndDataUrl = createCanvasImage(dndSize, dndSize, (ctx, w) => {
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, w / 2, w * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.25, w / 2);
    ctx.lineTo(w * 0.75, w / 2);
    ctx.stroke();
  });
  elementImages.push({ name: 'dnd_30x30.png', dataUrl: dndDataUrl, bounds: { x: 0, y: 0, width: dndSize, height: dndSize }, type: 'IMG_STATUS' });

  // Generate Alarm icon for IMG_STATUS (CLOCK)
  const alarmSize = 30;
  const alarmDataUrl = createCanvasImage(alarmSize, alarmSize, (ctx, w) => {
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, w * 0.55, w * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    // Bell top
    ctx.beginPath();
    ctx.moveTo(w * 0.35, w * 0.25);
    ctx.lineTo(w / 2, w * 0.1);
    ctx.lineTo(w * 0.65, w * 0.25);
    ctx.stroke();
  });
  elementImages.push({ name: 'alarm_30x30.png', dataUrl: alarmDataUrl, bounds: { x: 0, y: 0, width: alarmSize, height: alarmSize }, type: 'IMG_STATUS' });

  // Generate static label icons for decorative IMG elements
  // Heart icon (24x20)
  const heartIconDataUrl = createCanvasImage(24, 20, (ctx, w, h) => {
    ctx.fillStyle = '#FF6B6B';
    ctx.font = `${Math.floor(h * 0.9)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2665', w / 2, h / 2);
  });
  elementImages.push({ name: 'icon_heart_24x20.png', dataUrl: heartIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 20 }, type: 'IMG' });

  // Steps icon (24x24) - shoe/footprint
  const stepsIconDataUrl = createCanvasImage(24, 24, (ctx, w, h) => {
    ctx.fillStyle = '#FFD93D';
    ctx.font = `${Math.floor(h * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F463}', w / 2, h / 2);
  });
  elementImages.push({ name: 'icon_steps_24x24.png', dataUrl: stepsIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 24 }, type: 'IMG' });

  // Battery icon (24x14) - simple battery shape
  const battIconDataUrl = createCanvasImage(24, 14, (ctx, w, h) => {
    ctx.strokeStyle = '#00CC88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 2, w - 5, h - 4);
    ctx.fillStyle = '#00CC88';
    ctx.fillRect(w - 4, h * 0.3, 3, h * 0.4);
  });
  elementImages.push({ name: 'icon_batt_24x14.png', dataUrl: battIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 14 }, type: 'IMG' });

  // Generate bluetooth icon for IMG_STATUS
  const btSize = 30;
  const btDataUrl = createCanvasImage(btSize, btSize, (ctx, w) => {
    ctx.strokeStyle = '#4488FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, w * 0.2);
    ctx.lineTo(w * 0.65, w * 0.4);
    ctx.lineTo(w * 0.5, w * 0.5);
    ctx.lineTo(w * 0.65, w * 0.6);
    ctx.lineTo(w * 0.35, w * 0.8);
    ctx.moveTo(w * 0.5, w * 0.2);
    ctx.lineTo(w * 0.5, w * 0.8);
    ctx.stroke();
  });
  elementImages.push({
    name: 'bluetooth_30x30.png',
    dataUrl: btDataUrl,
    bounds: { x: 0, y: 0, width: btSize, height: btSize },
    type: 'IMG_STATUS',
  });

  // Generate transparent button image (1x1 transparent PNG)
  const transpDataUrl = createCanvasImage(1, 1, () => {
    // Transparent - no drawing needed
  });
  elementImages.push({
    name: 'trasparente.png',
    dataUrl: transpDataUrl,
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON',
  });

  // Generate clock hand images for TIME_POINTER
  // Hour hand: shorter, wider (22x140, pivot at bottom-center: posX=11, posY=70)
  const hourHandDataUrl = createCanvasImage(22, 140, (ctx, w, h) => {
    ctx.fillStyle = '#CCCCCC';
    // Tapered hand shape
    ctx.beginPath();
    ctx.moveTo(w / 2 - 4, h);        // bottom-left
    ctx.lineTo(w / 2 - 1, 10);       // top-left narrow
    ctx.lineTo(w / 2, 0);            // tip
    ctx.lineTo(w / 2 + 1, 10);       // top-right narrow
    ctx.lineTo(w / 2 + 4, h);        // bottom-right
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  elementImages.push({
    name: 'hour_hand.png',
    dataUrl: hourHandDataUrl,
    bounds: { x: 0, y: 0, width: 22, height: 140 },
    type: 'TIME_POINTER',
  });

  // Minute hand: longer, thinner (16x200, pivot at bottom-center: posX=8, posY=100)
  const minuteHandDataUrl = createCanvasImage(16, 200, (ctx, w, h) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 3, h);
    ctx.lineTo(w / 2 - 1, 10);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2 + 1, 10);
    ctx.lineTo(w / 2 + 3, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  elementImages.push({
    name: 'minute_hand.png',
    dataUrl: minuteHandDataUrl,
    bounds: { x: 0, y: 0, width: 16, height: 200 },
    type: 'TIME_POINTER',
  });

  // Second hand: longest, thinnest, red (6x240, pivot at bottom-center: posX=3, posY=120)
  const secondHandDataUrl = createCanvasImage(6, 240, (ctx, w, h) => {
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(w / 2 - 1, 0, 2, h);
    // Small circle at pivot
    ctx.beginPath();
    ctx.arc(w / 2, 120, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  elementImages.push({
    name: 'second_hand.png',
    dataUrl: secondHandDataUrl,
    bounds: { x: 0, y: 0, width: 6, height: 240 },
    type: 'TIME_POINTER',
  });

  // Cover (center cap over hands) - small circle 30x30
  const coverDataUrl = createCanvasImage(30, 30, (ctx, w, h) => {
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  elementImages.push({
    name: 'hand_cover.png',
    dataUrl: coverDataUrl,
    bounds: { x: 0, y: 0, width: 30, height: 30 },
    type: 'TIME_POINTER',
  });

  // Generate 29 weather level icons for IMG_LEVEL (matches Brushed Steel reference count)
  const weatherSize = 40;
  const weatherSymbols = [
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // sun, part-cloud, cloud, rain, thunder, snow, fog
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600',  // one more to reach 29
  ];
  for (let i = 0; i < 29; i++) {
    const filename = `weather_${i}.png`;
    const symbol = weatherSymbols[i] || '\u2600';
    const dataUrl = createCanvasImage(weatherSize, weatherSize, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.6)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, w / 2, h / 2);
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: weatherSize, height: weatherSize },
      type: 'IMG_LEVEL',
    });
  }

  // Generate background image for Background element
  const bgDataUrl = createCanvasImage(480, 480, (ctx, w, h) => {
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, w, h);
  });
  elementImages.push({
    name: 'background_ed15585c.png',
    dataUrl: bgDataUrl,
    bounds: { x: 0, y: 0, width: 480, height: 480 },
    type: 'IMG',
  });
  // Update Background element src for preview rendering
  const bgElement = elements.find(el => el.name === 'Background');
  if (bgElement) bgElement.src = bgDataUrl;

  // Generate static images for any remaining IMG-type elements with src
  elements
    .filter((el) => el.type === 'IMG' && el.src && el.name !== 'Background' && !el.name.toLowerCase().includes('time') && !el.name.toLowerCase().includes('weekday') && !el.name.toLowerCase().includes('date') && !el.name.toLowerCase().includes('month') && !el.name.toLowerCase().includes('icon'))
    .forEach((el) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(el.bounds.width || 100, 200);
      canvas.height = Math.max(el.bounds.height || 100, 200);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = el.color || '#555555';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/png');
      elementImages.push({
        name: el.src!,
        dataUrl,
        bounds: el.bounds,
        type: el.type,
      });
      el.src = dataUrl;
    });
  
  console.log('[Mock] Element images generated, total:', elementImages.length, 'images');

  const config: WatchFaceConfig = {
    name: `AI_WatchFace_${Date.now()}`,
    resolution,
    background: {
      src: 'bg.png',
      format: 'TGA-P',
    },
    elements,
    watchModel,
  };

  return { config, elementImages: elementImages };
}

function App() {
  const { state, dispatch } = useApp();
  const [watchModel, setWatchModel] = useState('Balance 2');
  const [watchFaceName, setWatchFaceName] = useState('');

  // AI Provider settings (persisted in localStorage)
  const [aiProvider, setAiProvider] = useState<AIProvider>(
    () => (localStorage.getItem('ai_provider') as AIProvider) || 'gemini'
  );
  const [aiApiKey, setAiApiKey] = useState(
    () => localStorage.getItem('ai_api_key') || ''
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useMockAnalysis, setUseMockAnalysis] = useState(false);
  const [usePipeline, setUsePipeline] = useState(
    () => localStorage.getItem('use_pipeline') === 'true'
  );

  // Persist AI settings
  const handleSetAiProvider = (provider: AIProvider) => {
    setAiProvider(provider);
    localStorage.setItem('ai_provider', provider);
  };
  const handleSetApiKey = (key: string) => {
    setAiApiKey(key);
    localStorage.setItem('ai_api_key', key);
  };

  // Handle continue to analysis
  const handleAnalyze = useCallback(async () => {
    if (!state.backgroundImage || !state.fullDesignImage) {
      toast.error('Please upload both images');
      return;
    }

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Analyzing images with AI...'));
    dispatch(actions.setStep('analyzing'));

    try {
      let config: WatchFaceConfig;
      let elementImages: ElementImage[];

      if (useMockAnalysis || !aiApiKey) {
        // Fallback to mock analysis
        if (!aiApiKey && !useMockAnalysis) {
          toast.info('No API key set — using mock analysis. Open Settings to add your key.');
        }
        const result = await mockKimiAnalysis(
          state.backgroundImage,
          state.fullDesignImage,
          watchModel
        );
        config = result.config;
        elementImages = result.elementImages;
      } else if (usePipeline) {
        // ─── Deterministic Pipeline Path ─────────────────────────────────
        // AI extracts semantic data ONLY → pipeline computes all geometry
        dispatch(actions.setLoadingMessage('Extracting elements with AI (pipeline mode)...'));
        const aiElements = await extractElementsFromImage(
          { provider: aiProvider as PipelineAIProvider, apiKey: aiApiKey },
          state.fullDesignFile!,
        );
        console.log('[App] Pipeline AI elements:', aiElements.length);

        dispatch(actions.setLoadingMessage('Running deterministic pipeline...'));
        const pipelineResult = await runPipeline(aiElements, {
          watchfaceName: watchFaceName?.trim() || `AI_WatchFace_${Date.now()}`,
          watchModel,
          backgroundSrc: 'background.png',
          aiConfig: { provider: aiProvider as PipelineAIProvider, apiKey: aiApiKey },
          onProgress: (msg) => dispatch(actions.setLoadingMessage(msg)),
        });

        // Pipeline returns both the WatchFaceConfig (with elements) and generated code
        config = pipelineResult.config;
        elementImages = generatePipelineAssets(pipelineResult.resolved);
        console.log('[App] Pipeline produced', config.elements.length, 'elements,', elementImages.length, 'asset images');
      } else {
        // ─── Legacy AI Path (coordinates from AI) ────────────────────────
        dispatch(actions.setLoadingMessage('Sending image to AI for analysis...'));
        const aiConfig: AIServiceConfig = { provider: aiProvider, apiKey: aiApiKey };
        const analysis = await analyzeWatchfaceImage(aiConfig, state.fullDesignFile!);
        
        console.log('[App] AI analysis result:', analysis.designDescription);
        console.log('[App] Complications:', analysis.complications.length);

        // Expand simplified AI analysis into full elements + Canvas-drawn assets
        dispatch(actions.setLoadingMessage('Generating elements and assets...'));
        const expanded = expandAnalysisToElements(analysis);
        elementImages = expanded.images;

        // Parse resolution from watch model
        const resolutions: Record<string, { width: number; height: number }> = {
          'Balance 2': { width: 480, height: 480 },
          'Balance': { width: 480, height: 480 },
          'Active Max': { width: 480, height: 480 },
          'Active 3 Premium': { width: 466, height: 466 },
          'Active 2 Round': { width: 466, height: 466 },
          'Active 2 Square': { width: 390, height: 450 },
          'Active': { width: 390, height: 450 },
          'Pop 3S (PIB)': { width: 410, height: 502 },
          'GTR4': { width: 466, height: 466 },
          'GTS4': { width: 390, height: 450 },
          'Cheetah Pro': { width: 466, height: 466 },
          'T-Rex 2': { width: 454, height: 454 },
          'Falcon': { width: 416, height: 416 },
        };
        const resolution = resolutions[watchModel] || { width: 480, height: 480 };

        config = {
          name: `AI_WatchFace_${Date.now()}`,
          resolution,
          background: { src: 'background.png', format: 'TGA-P' },
          elements: expanded.elements,
          watchModel,
        };
      }

      // Update state with results
      if (watchFaceName?.trim()) {
        config.name = watchFaceName.trim();
      }

      dispatch(actions.setWatchFaceConfig(config));
      dispatch(actions.setElementImages(elementImages));
      dispatch(actions.setStep('preview'));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('upload'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.backgroundImage, state.fullDesignImage, watchModel, watchFaceName, usePipeline, aiProvider, aiApiKey, useMockAnalysis, dispatch]);

  // Handle generate ZPK
  const handleGenerate = useCallback(async () => {
    console.log('[App] handleGenerate called');
    
    if (!state.watchFaceConfig) {
      console.log('[App] ERROR: Missing watchFaceConfig');
      toast.error('Missing configuration');
      return;
    }
    
    if (!state.backgroundFile) {
      console.log('[App] ERROR: Missing backgroundFile');
      toast.error('Missing background file');
      return;
    }

    if (!state.githubToken) {
      console.log('[App] ERROR: Missing githubToken');
      toast.error('Please set your GitHub token in settings');
      return;
    }

    console.log('[App] All checks passed, starting generation...');
    console.log('[App] Background file:', state.backgroundFile.name, 'size:', state.backgroundFile.size);

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Generating ZPK file...'));
    dispatch(actions.setStep('generating'));

    try {
      // Build ZPK using File objects
      console.log('[App] Calling buildZPK...');
      
      // Convert elementImages from dataUrl to File objects
      const elementFiles = state.elementImages.map((img) => {
        console.log('[App] Converting element image to file:', img.name);
        
        // Parse data URL properly
        const parts = img.dataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const blob = new Blob([u8arr], { type: mimeType });
        
        console.log('[App] Converted', img.name, 'size:', blob.size);
        return {
          src: img.name,
          file: new File([blob], img.name, { type: mimeType }),
        };
      });
      
      console.log('[App] Element files prepared:', { count: elementFiles.length, files: elementFiles.map(f => f.src) });
      
      if (elementFiles.length === 0) {
        console.warn('[App] WARNING: No element files were prepared!');
      }
      
      const zpkResult = await buildZPK({
        config: state.watchFaceConfig,
        backgroundFile: state.backgroundFile,
        elementFiles,
      });
      console.log('[App] ZPK built successfully, size:', zpkResult.size);

      dispatch(actions.setZpkBlob(zpkResult.blob));

      // Upload to GitHub with folder-based structure
      dispatch(actions.setLoadingMessage('Uploading to GitHub...'));

      const repoParts = state.githubRepo.split('/');
      const owner = repoParts[0];
      const repo = repoParts[1];
      
      console.log('[App] GitHub repo split:', { original: state.githubRepo, owner, repo, parts: repoParts });
      
      if (!owner || !repo || repoParts.length !== 2) {
        throw new Error(`Invalid GitHub repository format: "${state.githubRepo}". Expected format: "owner/repo"`);
      }

      // Step 1: Generate QR code with the expected GitHub Pages URL
      //  We use the watchface ID (timestamp-based) to create a predictable URL
      const watchfaceId = state.watchFaceConfig.name.replace(/\s+/g, '_');
      const expectedZpkUrl = `https://${owner}.github.io/${repo}/zpk/${watchfaceId}/face.zpk`;
      
      dispatch(actions.setLoadingMessage('Generating QR code...'));
      console.log('[App] Generating QR with expected URL:', expectedZpkUrl);
      const qrDataUrl = await generateQRCode(expectedZpkUrl);
      console.log('[App] QR code generated');

      // Step 2: Upload both ZPK and QR code to the same folder on GitHub
      console.log('[App] Starting folder-based upload (ZPK + QR)...');
      const uploadResult = await uploadZPKWithQR(
        {
          token: state.githubToken,
          owner,
          repo,
        },
        watchfaceId,
        zpkResult.blob,
        qrDataUrl,
        state.watchFaceConfig.name
      );

      if (!uploadResult.success) {
        console.error('[App] Upload error:', uploadResult.error);
        throw new Error(`GitHub upload failed: ${uploadResult.error || 'Unknown error'}`);
      }
      
      console.log('[App] Upload successful!');
      console.log('[App] ZPK URL:', uploadResult.downloadUrl);
      console.log('[App] QR URL:', uploadResult.qrUrl);

      dispatch(actions.setGithubUrl(uploadResult.downloadUrl || ''));
      dispatch(actions.setQrCode(qrDataUrl));

      dispatch(actions.setStep('success'));
      toast.success('Watch face created successfully!');
    } catch (error) {
      console.error('[App] Generation failed with error:', error);
      if (error instanceof Error) {
        console.error('[App] Error stack:', error.stack);
      }
      toast.error('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('preview'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.watchFaceConfig, state.backgroundFile, state.githubToken, state.githubRepo, dispatch]);

  // Handle reset
  const handleReset = useCallback(() => {
    dispatch(actions.reset());
    setWatchFaceName('');
    toast.info('Started new watch face');
  }, [dispatch]);

  // Toggle element visibility
  const handleToggleElement = useCallback(
    (id: string) => {
      if (!state.watchFaceConfig) return;

      const updatedElements = state.watchFaceConfig.elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      );

      dispatch(
        actions.setWatchFaceConfig({
          ...state.watchFaceConfig,
          elements: updatedElements,
        })
      );
    },
    [state.watchFaceConfig, dispatch]
  );

  // Render different steps
  const renderContent = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            {/* Watch Model & Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Model</Label>
                <select
                  value={watchModel}
                  onChange={(e) => setWatchModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-[#0F0F0F] border border-zinc-700 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                >
                  {/* User's requested models - Balance 2 as default */}
                  <option value="Balance 2">⭐ Amazfit Balance 2 (480×480)</option>
                  <option value="Balance">Amazfit Balance (480×480)</option>
                  <option value="Active Max">Amazfit Active Max (480×480)</option>
                  <option value="Active 3 Premium">Amazfit Active 3 Premium (466×466)</option>
                  <option value="Active 2 Round">Amazfit Active 2 Round (466×466)</option>
                  <option value="Active 2 Square">Amazfit Active 2 Square (390×450)</option>
                  <option value="Active">Amazfit Active (390×450)</option>
                  <option value="Pop 3S (PIB)">Amazfit Pop 3S / PIB (410×502)</option>
                  {/* Original models */}
                  <option value="GTR4">Amazfit GTR 4 (466×466)</option>
                  <option value="GTS4">Amazfit GTS 4 (390×450)</option>
                  <option value="Cheetah Pro">Amazfit Cheetah Pro (466×466)</option>
                  <option value="T-Rex 2">Amazfit T-Rex 2 (454×454)</option>
                  <option value="Falcon">Amazfit Falcon (416×416)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Face Name (optional)</Label>
                <Input
                  value={watchFaceName}
                  onChange={(e) => setWatchFaceName(e.target.value.trim())}
                  placeholder="My Custom Watch Face"
                  className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* AI Settings Panel */}
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#141414] hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-300">AI Settings</span>
                  {aiApiKey ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">
                      {aiProvider === 'gemini' ? 'Gemini' : 'GPT-4o'} configured
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400">
                      Mock mode
                    </span>
                  )}
                </div>
                <span className="text-zinc-500 text-xs">{showSettings ? '▲' : '▼'}</span>
              </button>

              {showSettings && (
                <div className="px-4 py-4 space-y-4 border-t border-zinc-800">
                  {/* Provider selector */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-300">AI Provider</Label>
                      <select
                        value={aiProvider}
                        onChange={(e) => handleSetAiProvider(e.target.value as AIProvider)}
                        className="w-full h-10 px-3 rounded-md bg-[#0F0F0F] border border-zinc-700 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                      >
                        <option value="gemini">Google Gemini 2.0 Flash (cheapest)</option>
                        <option value="openai">OpenAI GPT-4o (most reliable)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-300">API Key</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={aiApiKey}
                          onChange={(e) => handleSetApiKey(e.target.value)}
                          placeholder={aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
                          className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600 pr-20"
                        />
                        <div className="absolute right-1 top-1 flex gap-1">
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-300"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={async () => {
                              if (!aiApiKey) return;
                              const valid = await testApiKey({ provider: aiProvider, apiKey: aiApiKey });
                              toast[valid ? 'success' : 'error'](valid ? 'API key is valid!' : 'API key is invalid');
                            }}
                            className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock mode toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMockAnalysis}
                        onChange={(e) => setUseMockAnalysis(e.target.checked)}
                        className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm text-zinc-400">Use mock analysis (no API call, demo data)</span>
                    </label>
                  </div>

                  {/* Pipeline mode toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePipeline}
                        onChange={(e) => {
                          setUsePipeline(e.target.checked);
                          localStorage.setItem('use_pipeline', String(e.target.checked));
                        }}
                        className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                      />
                      <span className="text-sm text-zinc-400">Use deterministic pipeline (AI for semantics only, no coordinates from AI)</span>
                    </label>
                  </div>

                  <p className="text-xs text-zinc-600">
                    {aiProvider === 'gemini'
                      ? 'Get your API key from Google AI Studio: aistudio.google.com/apikey'
                      : 'Get your API key from OpenAI: platform.openai.com/api-keys'}
                  </p>
                </div>
              )}
            </div>

            {/* Upload zones */}
            <div className="grid gap-4 sm:grid-cols-2">
              <UploadZone
                label="Background Image"
                sublabel="Clean 480×480 background"
                value={state.backgroundImage}
                onChange={(img) => dispatch(actions.setBackgroundImage(img))}
                onFileChange={(file) => dispatch(actions.setBackgroundFile(file))}
                expectedWidth={480}
                expectedHeight={480}
              />
              <UploadZone
                label="Full Design"
                sublabel="Complete design with elements"
                value={state.fullDesignImage}
                onChange={(img) => dispatch(actions.setFullDesignImage(img))}
                onFileChange={(file) => dispatch(actions.setFullDesignFile(file))}
              />
            </div>

            {/* Continue button */}
            <Button
              onClick={handleAnalyze}
              disabled={!state.backgroundImage || !state.fullDesignImage}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze with AI
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-cyan-500 animate-spin" />
              <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing your design...</h3>
            <p className="text-zinc-500 text-center max-w-md">
              Our AI is detecting watch face elements, calculating positions, and preparing the configuration.
            </p>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {state.backgroundImage && state.watchFaceConfig && (
              <>
                {/* Geometry-accurate canvas preview */}
                <div className="flex flex-col items-center">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Watch Face Preview</h4>
                  <CanvasWatchPreview
                    backgroundImage={state.backgroundImage}
                    elements={state.watchFaceConfig.elements}
                    className="w-full max-w-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Pixel-accurate widget positions</p>
                </div>

                {/* Elements list */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Detected Elements</h4>
                  <ElementList
                    elements={state.watchFaceConfig.elements}
                    onToggleVisibility={handleToggleElement}
                  />
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handleGenerate}
                className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate ZPK & Upload
              </Button>
              <Button
                onClick={() => dispatch(actions.setStep('upload'))}
                variant="outline"
                className="h-12 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-green-500 animate-spin" />
              <RefreshCw className="absolute inset-0 m-auto h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Building your watch face...</h3>
            <div className="w-full max-w-md mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Converting images to TGA format
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Generating JavaScript code
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Packaging ZPK file
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-zinc-700" />
                Uploading to GitHub
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6">
            {state.qrCodeDataUrl && state.githubUrl && (
              <QRDisplay
                qrCodeDataUrl={state.qrCodeDataUrl}
                githubUrl={state.githubUrl}
                zpkBlob={state.zpkBlob}
                filename={state.watchFaceConfig?.name + '.zpk'}
              />
            )}

            <Button
              onClick={handleReset}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Create Another Watch Face
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={state.currentStep} />
        </div>

        {/* Main content card */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-zinc-800 p-6">
          {renderContent()}
        </div>

        {/* Tips */}
        {state.currentStep === 'upload' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="text-sm font-medium text-white mb-1">Design in Gemini</h4>
              <p className="text-xs text-zinc-500">
                Create your watch face design using Gemini AI with detailed prompts.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">📤</div>
              <h4 className="text-sm font-medium text-white mb-1">Upload Images</h4>
              <p className="text-xs text-zinc-500">
                Upload clean background and full design images for AI analysis.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">⌚</div>
              <h4 className="text-sm font-medium text-white mb-1">Install on Watch</h4>
              <p className="text-xs text-zinc-500">
                Scan the QR code with Zepp app to install your custom watch face.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Loading overlay */}
      <LoadingOverlay
        isVisible={state.isLoading}
        title={state.loadingMessage || 'Processing...'}
      />
    </div>
  );
}

export default App;
