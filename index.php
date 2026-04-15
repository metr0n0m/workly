
<?php
require_once __DIR__ . '/includes/config.php';

$langs = [
    'en' => require __DIR__ . '/lang/en.php',
    'ru' => require __DIR__ . '/lang/ru.php',
    'he' => require __DIR__ . '/lang/he.php',
    'ar' => require __DIR__ . '/lang/ar.php',
    'id' => require __DIR__ . '/lang/id.php',
    'vi' => require __DIR__ . '/lang/vi.php',
    'tr' => require __DIR__ . '/lang/tr.php',
    'tl' => require __DIR__ . '/lang/tl.php',
    'th' => require __DIR__ . '/lang/th.php',
    'de' => require __DIR__ . '/lang/de.php',
    'fr' => require __DIR__ . '/lang/fr.php',
    'es' => require __DIR__ . '/lang/es.php',
];

$langNames = [
    'en' => 'English',
    'ru' => 'Русский',
    'he' => 'עברית',
    'ar' => 'العربية',
    'id' => 'Bahasa Indonesia',
    'vi' => 'Tiếng Việt',
    'tr' => 'Türkçe',
    'tl' => 'Filipino',
    'th' => 'ภาษาไทย',
    'de' => 'Deutsch',
    'fr' => 'Français',
    'es' => 'Español',
];
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="author" content="Alexsandr Lavrenchuk">
    <meta name="description" content="Work shift countdown timer">
    <meta name="theme-color" content="#1a73e8">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Workly">
    <link rel="manifest" href="manifest.json">

    <title><?= APP_NAME ?></title>

    <!-- Bootstrap 5 LTR (swapped to RTL via JS when RTL language selected) -->
    <link id="bootstrapCss" rel="stylesheet" href="assets/css/bootstrap.min.css">
    <!-- FontAwesome 6 -->
    <link rel="stylesheet" href="assets/css/all.min.css">
    <!-- App styles -->
    <link rel="stylesheet" href="assets/css/app.css?v=<?= filemtime(__DIR__ . '/assets/css/app.css') ?>">
</head>
<body>

<div class="app-card">

    <!-- Language switcher -->
    <div class="lang-switcher">
        <select id="langSelect" class="lang-select">
            <?php foreach ($langNames as $code => $name): ?>
            <option value="<?= $code ?>"><?= strtoupper($code) ?> · <?= htmlspecialchars($name) ?></option>
            <?php endforeach; ?>
        </select>
    </div>

    <!-- Title -->
    <h1 class="app-title" id="appTitle">
        <i class="fa-solid fa-clock"></i> Shift Timer
    </h1>

    <!-- Shift quick-select buttons -->
    <div class="shift-presets">
        <button class="shift-btn" data-hours="4">4h</button>
        <button class="shift-btn" data-hours="6">6h</button>
        <button class="shift-btn" data-hours="8">8h</button>
        <button class="shift-btn" data-hours="9">9h</button>
        <button class="shift-btn" data-hours="10">10h</button>
        <button class="shift-btn" data-hours="12">12h</button>
    </div>

    <!-- Duration manual input -->
    <div class="duration-row">
        <div class="time-input-group">
            <input type="number" id="hoursInput" value="9" min="0" max="23" inputmode="numeric" pattern="\d*">
            <label id="hoursLabel">Hours</label>
        </div>
        <div class="time-sep">:</div>
        <div class="time-input-group">
            <input type="number" id="minutesInput" value="0" min="0" max="59" inputmode="numeric" pattern="\d*">
            <label id="minutesLabel">Minutes</label>
        </div>
    </div>

    <!-- Start-time panel toggle -->
    <div class="start-time-toggle" id="startTimeToggle">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span id="startTimeToggleText">Started earlier?</span>
        <i class="fa-solid fa-chevron-down toggle-arrow"></i>
    </div>

    <!-- Start-time panel -->
    <div class="start-time-panel" id="startTimePanel">
        <label id="startTimeLabel">Shift started at</label>
        <input type="time" id="shiftStartInput">
        <div class="elapsed-info" id="elapsedInfo"></div>
    </div>

    <!-- Status badge -->
    <div class="status-badge status-ready" id="statusBadge">
        <i class="fa-solid fa-circle-check"></i> Ready
    </div>

    <!-- Timer display -->
    <div class="timer-display" id="timerDisplay">09:00:00</div>

    <!-- Progress bar -->
    <div class="progress-wrap">
        <div class="progress-bar-inner" id="progressBar" style="width:100%"></div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
        <button id="startBtn" class="btn-action btn-start">
            <i class="fa-solid fa-play"></i> Start
        </button>
        <button id="resetBtn" class="btn-action btn-reset">
            <i class="fa-solid fa-rotate-left"></i> Reset
        </button>
    </div>

    <footer class="app-footer">&copy; Alexsandr Lavrenchuk</footer>
</div>

<!-- jQuery -->
<script src="assets/js/jquery.min.js?v=<?= filemtime(__DIR__ . '/assets/js/jquery.min.js') ?>"></script>
<!-- Bootstrap Bundle (Popper included) -->
<script src="assets/js/bootstrap.bundle.min.js?v=<?= filemtime(__DIR__ . '/assets/js/bootstrap.bundle.min.js') ?>"></script>
<!-- Translations from PHP lang files -->
<script>
const T = <?= json_encode($langs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?>;
</script>
<!-- App logic -->
<script src="assets/js/app.js?v=<?= filemtime(__DIR__ . '/assets/js/app.js') ?>"></script>

<script>
    // Swap Bootstrap CSS for RTL languages
    $(document).on('change', '#langSelect', function () {
        const l = $(this).val();
        const isRtl = l === 'he' || l === 'ar';
        $('#bootstrapCss').attr('href',
            isRtl ? 'assets/css/bootstrap.rtl.min.css' : 'assets/css/bootstrap.min.css'
        );
    });

    // Service Worker registration (PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('[SW] Registered'))
                .catch(err => console.warn('[SW] Failed:', err));
        });
    }
</script>

</body>
</html>
