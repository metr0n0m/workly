/* =========================================
   Workly – Work Timer  |  app.js
   T is injected by PHP in index.php from lang/*.php files
   ========================================= */

'use strict';

/* ---------- State ---------- */
let lang         = localStorage.getItem('workly_lang') || 'en';
let interval     = null;
let remaining    = 0;
let totalSeconds = 0;
let isPaused     = false;

/* ---------- Helpers ---------- */
const pad = n => String(n).padStart(2, '0');
const fmt = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
const tr  = () => T[lang];

function saveLang(l) { localStorage.setItem('workly_lang', l); }

/* ---------- Audio alarm ---------- */
function playAlarm() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const tone = (freq, startAt, dur) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
            gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + startAt + 0.05);
            gain.gain.linearRampToValueAtTime(0,    ctx.currentTime + startAt + dur);
            osc.start(ctx.currentTime + startAt);
            osc.stop(ctx.currentTime  + startAt + dur + 0.1);
        };
        tone(880, 0.0, 0.35);
        tone(880, 0.5, 0.35);
        tone(880, 1.0, 0.55);
    } catch (e) {}
}

/* ---------- UI ---------- */
function applyLang(l) {
    lang = l;
    const t = tr();
    $('html').attr({ lang: l, dir: t.dir });
    $('#appTitle').html(`<i class="fa-solid fa-clock"></i> ${t.title}`);
    $('#hoursLabel').text(t.hours);
    $('#minutesLabel').text(t.minutes);
    $('#startTimeToggleText').text(t.start_time_toggle);
    $('#startTimeLabel').text(t.start_time_label);
    $('#resetBtn').html(`<i class="fa-solid fa-rotate-left"></i> ${t.reset}`);
    $('.lang-btn').removeClass('active');
    $(`.lang-btn[data-lang="${l}"]`).addClass('active');
    saveLang(l);
    refreshElapsedText();  // перерисовать строку с текущим языком
    updateStartBtn();
    updateStatusBadge();
}

function updateStartBtn() {
    const t = tr();
    const $b = $('#startBtn');
    $b.removeClass('btn-start btn-pause');
    if (interval) {
        $b.addClass('btn-pause').html(`<i class="fa-solid fa-pause"></i> ${t.pause}`);
    } else if (isPaused) {
        $b.addClass('btn-start').html(`<i class="fa-solid fa-play"></i> ${t.resume}`);
    } else {
        $b.addClass('btn-start').html(`<i class="fa-solid fa-play"></i> ${t.start}`);
    }
}

function updateStatusBadge() {
    const t = tr();
    const $el = $('#statusBadge');
    $el.removeClass('status-ready status-running status-paused status-done');
    if (interval) {
        $el.addClass('status-running').html(`<i class="fa-solid fa-circle-play"></i> ${t.running}`);
    } else if (isPaused) {
        $el.addClass('status-paused').html(`<i class="fa-solid fa-circle-pause"></i> ${t.paused}`);
    } else {
        $el.addClass('status-ready').html(`<i class="fa-solid fa-circle-check"></i> ${t.ready}`);
    }
}

function updateDisplay() {
    $('#timerDisplay').text(fmt(remaining));
    const $d = $('#timerDisplay');
    const $p = $('#progressBar');
    $d.removeClass('warning danger');
    $p.removeClass('warning danger');
    if (totalSeconds > 0) {
        $('#progressBar').css('width', (remaining / totalSeconds * 100) + '%');
        if (remaining <= 600)       { $d.addClass('danger');  $p.addClass('danger');  }
        else if (remaining <= 1800) { $d.addClass('warning'); $p.addClass('warning'); }
    }
}

/* ---------- Elapsed time helpers ---------- */
function getElapsedSeconds() {
    const val = $('#shiftStartInput').val();
    if (!val) return 0;
    const [hh, mm] = val.split(':').map(Number);
    const start = new Date();
    start.setHours(hh, mm, 0, 0);
    const diff = Math.floor((Date.now() - start.getTime()) / 1000);
    return diff > 0 ? diff : 0;
}

function getShiftDurationSeconds() {
    const h = parseInt($('#hoursInput').val())   || 0;
    const m = parseInt($('#minutesInput').val()) || 0;
    return h * 3600 + m * 60;
}

/* Перерисовывает строку "уже отработано" на текущем языке.
   Вызывается и при вводе времени, и при смене языка.        */
function refreshElapsedText() {
    const val = $('#shiftStartInput').val();
    const $info = $('#elapsedInfo');

    if (!val) {
        $info.removeClass('visible').text('');
        return;
    }

    const shiftSec = getShiftDurationSeconds();
    const elapsed  = getElapsedSeconds();

    if (elapsed <= 0) {
        $info.removeClass('visible').text('');
        return;
    }

    if (elapsed >= shiftSec) {
        $info.addClass('visible').text(tr().elapsed_over);
    } else {
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const msg = tr().elapsed_msg.replace('{h}', h).replace('{m}', m);
        $info.addClass('visible').text(msg);
    }
}

/* Пересчитывает remaining/totalSeconds и обновляет дисплей.
   Вызывается только когда таймер НЕ запущен и НЕ на паузе. */
function recalcDisplay() {
    if (interval || isPaused) return;
    const shiftSec = getShiftDurationSeconds();
    const elapsed  = getElapsedSeconds();
    totalSeconds = shiftSec;
    remaining    = Math.max(0, shiftSec - elapsed);
    updateDisplay();
}

/* ---------- Timer control ---------- */
function startTimer() {
    if (remaining <= 0) return;
    isPaused = false;
    interval = setInterval(() => {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
            clearInterval(interval);
            interval = null;
            $('#statusBadge').removeClass('status-running').addClass('status-done')
                .html(`<i class="fa-solid fa-bell"></i> ${tr().done}`);
            updateStartBtn();
            playAlarm();
            if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
        }
    }, 1000);
    updateStartBtn();
    updateStatusBadge();
}

function resetTimer() {
    clearInterval(interval);
    interval  = null;
    isPaused  = false;
    $('#hoursInput').val(9);
    $('#minutesInput').val(0);
    $('#shiftStartInput').val('');
    $('#startTimePanel').removeClass('visible');
    $('#startTimeToggle').removeClass('open');
    $('#elapsedInfo').removeClass('visible').text('');
    $('.shift-btn').removeClass('active');
    $(`.shift-btn[data-hours="9"]`).addClass('active');
    remaining    = 9 * 3600;
    totalSeconds = remaining;
    updateDisplay();
    updateStartBtn();
    updateStatusBadge();
    $('#progressBar').css('width', '100%').removeClass('warning danger');
}

/* ---------- Events ---------- */
$('#startBtn').on('click', function () {
    if (interval) {
        clearInterval(interval);
        interval = null;
        isPaused = true;
        updateStartBtn();
        updateStatusBadge();
    } else {
        if (!isPaused) {
            totalSeconds = getShiftDurationSeconds();
            const elapsed = getElapsedSeconds();
            remaining = totalSeconds - elapsed;
            if (remaining <= 0) {
                alert(tr().elapsed_over);
                return;
            }
            updateDisplay();
        }
        startTimer();
    }
});

$('#resetBtn').on('click', resetTimer);

$('.shift-btn').on('click', function () {
    const h = parseInt($(this).data('hours'));
    $('.shift-btn').removeClass('active');
    $(this).addClass('active');
    $('#hoursInput').val(h);
    $('#minutesInput').val(0);
    recalcDisplay();
    refreshElapsedText();
});

$('#hoursInput, #minutesInput').on('input', function () {
    const h = parseInt($('#hoursInput').val()) || 0;
    const m = parseInt($('#minutesInput').val()) || 0;
    $('.shift-btn').removeClass('active');
    $(`.shift-btn[data-hours="${h}"]`).filter(function () { return m === 0; }).addClass('active');
    recalcDisplay();
    refreshElapsedText();
});

$('#startTimeToggle').on('click', function () {
    $(this).toggleClass('open');
    $('#startTimePanel').toggleClass('visible');
    if (!$('#startTimePanel').hasClass('visible')) {
        $('#shiftStartInput').val('');
        $('#elapsedInfo').removeClass('visible').text('');
        recalcDisplay();
    }
});

$('#shiftStartInput').on('change input', function () {
    refreshElapsedText();
    recalcDisplay();
});

$('.lang-btn').on('click', function () {
    applyLang($(this).data('lang'));
});

/* ---------- Init ---------- */
$(function () {
    remaining    = 9 * 3600;
    totalSeconds = remaining;
    applyLang(lang);
    updateDisplay();
    $(`.shift-btn[data-hours="9"]`).addClass('active');
});
