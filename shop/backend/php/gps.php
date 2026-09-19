<?php
/**
 * Vixy Platform - Endpoint Dedicado de Telemetría GPS
 * Permite a la aplicación móvil enviar ubicación directamente a /api/gps.php
 */
$_GET['action'] = 'gps';
require_once __DIR__ . '/conductores.php';
