<?php
// Run once: php generate_icons.php
// Generates assets/icons/icon-192.png and icon-512.png

function makeIcon(int $size, string $outPath): void {
    $img = imagecreatetruecolor($size, $size);
    imageantialias($img, true);

    $bg      = imagecolorallocate($img, 26,  115, 232);   // #1a73e8
    $white   = imagecolorallocate($img, 255, 255, 255);
    $light   = imagecolorallocate($img, 180, 210, 250);

    // Background fill
    imagefill($img, 0, 0, $bg);

    // Rounded corners via mask
    $radius = (int)($size * 0.22);
    imagefilledarc($img, $radius,         $radius,         $radius*2, $radius*2, 180, 270, $white, IMG_ARC_PIE);
    imagefilledarc($img, $size-$radius,   $radius,         $radius*2, $radius*2, 270, 360, $white, IMG_ARC_PIE);
    imagefilledarc($img, $radius,         $size-$radius,   $radius*2, $radius*2,  90, 180, $white, IMG_ARC_PIE);
    imagefilledarc($img, $size-$radius,   $size-$radius,   $radius*2, $radius*2,   0,  90, $white, IMG_ARC_PIE);
    // Restore corners to bg
    imagefilledarc($img, $radius,         $radius,         $radius*2, $radius*2, 180, 270, $bg, IMG_ARC_PIE);
    imagefilledarc($img, $size-$radius,   $radius,         $radius*2, $radius*2, 270, 360, $bg, IMG_ARC_PIE);
    imagefilledarc($img, $radius,         $size-$radius,   $radius*2, $radius*2,  90, 180, $bg, IMG_ARC_PIE);
    imagefilledarc($img, $size-$radius,   $size-$radius,   $radius*2, $radius*2,   0,  90, $bg, IMG_ARC_PIE);

    // Clock circle
    $cx = (int)($size / 2);
    $cy = (int)($size / 2);
    $r  = (int)($size * 0.30);
    $t  = max(2, (int)($size * 0.045));

    // White filled circle
    imagefilledellipse($img, $cx, $cy, $r*2, $r*2, $white);

    // Clock hands (blue)
    $hx = (int)($cx + $r * 0.55 * sin(deg2rad(-60)));
    $hy = (int)($cy - $r * 0.55 * cos(deg2rad(-60)));
    imagesetthickness($img, max(2, (int)($size * 0.03)));
    imageline($img, $cx, $cy, $hx, $hy, $bg);      // hour hand

    $mx = (int)($cx + $r * 0.75 * sin(deg2rad(90)));
    $my = (int)($cy - $r * 0.75 * cos(deg2rad(90)));
    imageline($img, $cx, $cy, $mx, $my, $bg);       // minute hand

    // Center dot
    imagefilledellipse($img, $cx, $cy, max(4, (int)($size*0.045)), max(4, (int)($size*0.045)), $bg);

    // "W" text below clock
    $fsize = max(8, (int)($size * 0.12));
    $ty    = (int)($cy + $r + $fsize * 1.5);
    imagestring($img, 5, (int)($cx - $fsize * 0.35), $ty, 'W', $white);

    imagepng($img, $outPath, 9);
    imagedestroy($img);
    echo "Created: $outPath (" . filesize($outPath) . " bytes)\n";
}

$base = __DIR__ . '/assets/icons/';
makeIcon(192, $base . 'icon-192.png');
makeIcon(512, $base . 'icon-512.png');
echo "Done.\n";
