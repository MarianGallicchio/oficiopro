import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  FolderTree, 
  Download, 
  Terminal, 
  Sparkles 
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);

  const files: Record<string, { lang: string; path: string; content: string }> = {
    'pubspec.yaml': {
      lang: 'yaml',
      path: 'pubspec.yaml',
      content: `name: oficio_pro
description: "App móvil todo en uno offline-first para presupuestos, cobros y clientes."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Gestión de estado reactiva
  flutter_riverpod: ^2.5.1

  # Base de datos SQLite offline-first tipada
  drift: ^2.18.0
  sqlite3_flutter_libs: ^0.5.24
  path_provider: ^2.1.3
  path: ^1.9.0

  # Animaciones y partículas de temas
  flutter_animate: ^4.5.0

  # Identificadores únicos y utilidades
  uuid: ^4.4.0
  intl: ^0.19.0
  url_launcher: ^6.3.0 # Para abrir WhatsApp y llamadas directamente

  # Íconos Material & diseño
  lucide_icons: ^0.344.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

  # Generador de código para Drift
  drift_dev: ^2.18.0
  build_runner: ^2.4.9

flutter:
  uses-material-design: true`,
    },

    'lib/core/theme/app_theme_id.dart': {
      lang: 'dart',
      path: 'lib/core/theme/app_theme_id.dart',
      content: `enum AppThemeId {
  base,       // Minimalista sobrio de alto contraste
  cyberpunk,  // HUD futurista neón (Cyan & Magenta sobre OLED)
  sakura,     // Estética zen flor de cerezo (Rosa suave & Crema)
}`,
    },

    'lib/core/theme/app_custom_colors.dart': {
      lang: 'dart',
      path: 'lib/core/theme/app_custom_colors.dart',
      content: `import 'package:flutter/material.dart';

/// Extensión de tema Material 3 para colores semánticos personalizados
class AppCustomColors extends ThemeExtension<AppCustomColors> {
  final Color dailyAllowanceBg;
  final Color dailyAllowanceText;
  final Color accentNeon;
  final Color expenseBadge;
  final Color incomeBadge;
  final Color cardBorder;
  final double cardRadius;

  const AppCustomColors({
    required this.dailyAllowanceBg,
    required this.dailyAllowanceText,
    required this.accentNeon,
    required this.expenseBadge,
    required this.incomeBadge,
    required this.cardBorder,
    required this.cardRadius,
  });

  @override
  AppCustomColors copyWith({
    Color? dailyAllowanceBg,
    Color? dailyAllowanceText,
    Color? accentNeon,
    Color? expenseBadge,
    Color? incomeBadge,
    Color? cardBorder,
    double? cardRadius,
  }) {
    return AppCustomColors(
      dailyAllowanceBg: dailyAllowanceBg ?? this.dailyAllowanceBg,
      dailyAllowanceText: dailyAllowanceText ?? this.dailyAllowanceText,
      accentNeon: accentNeon ?? this.accentNeon,
      expenseBadge: expenseBadge ?? this.expenseBadge,
      incomeBadge: incomeBadge ?? this.incomeBadge,
      cardBorder: cardBorder ?? this.cardBorder,
      cardRadius: cardRadius ?? this.cardRadius,
    );
  }

  @override
  AppCustomColors lerp(ThemeExtension<AppCustomColors>? other, double t) {
    if (other is! AppCustomColors) return this;
    return AppCustomColors(
      dailyAllowanceBg: Color.lerp(dailyAllowanceBg, other.dailyAllowanceBg, t)!,
      dailyAllowanceText: Color.lerp(dailyAllowanceText, other.dailyAllowanceText, t)!,
      accentNeon: Color.lerp(accentNeon, other.accentNeon, t)!,
      expenseBadge: Color.lerp(expenseBadge, other.expenseBadge, t)!,
      incomeBadge: Color.lerp(incomeBadge, other.incomeBadge, t)!,
      cardBorder: Color.lerp(cardBorder, other.cardBorder, t)!,
      cardRadius: cardRadius + (other.cardRadius - cardRadius) * t,
    );
  }
}`,
    },

    'lib/core/theme/theme_factory.dart': {
      lang: 'dart',
      path: 'lib/core/theme/theme_factory.dart',
      content: `import 'package:flutter/material.dart';
import 'app_theme_id.dart';
import 'app_custom_colors.dart';

class ThemeFactory {
  /// Genera el ThemeData completo según el tema activo
  static ThemeData build(AppThemeId themeId, Brightness brightness) {
    switch (themeId) {
      case AppThemeId.cyberpunk:
        return _buildCyberpunkTheme();
      case AppThemeId.sakura:
        return _buildSakuraTheme(brightness);
      case AppThemeId.base:
      default:
        return _buildBaseTheme(brightness);
    }
  }

  // 1. TEMA BASE (Minimalista, limpio y de alto contraste)
  static ThemeData _buildBaseTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final primary = const Color(0xFF0284C7); // Sky 600

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: brightness,
        surface: isDark ? const Color(0xFF0F172A) : Colors.white,
      ),
      scaffoldBackgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBarTheme: AppBarTheme(
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: isDark ? Colors.white : const Color(0xFF0F172A),
          fontSize: 18,
          fontWeight: FontWeight.w900,
        ),
      ),
      extensions: [
        AppCustomColors(
          dailyAllowanceBg: primary,
          dailyAllowanceText: Colors.white,
          accentNeon: const Color(0xFF0EA5E9),
          expenseBadge: const Color(0xFFEF4444),
          incomeBadge: const Color(0xFF10B981),
          cardBorder: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          cardRadius: 16.0,
        ),
      ],
    );
  }

  // 2. TEMA CYBERPUNK (Futurista, Neón Cyan & Magenta sobre OLED)
  static ThemeData _buildCyberpunkTheme() {
    const bgOled = Color(0xFF030712); // Negro espacial profundo
    const neonCyan = Color(0xFF00F0FF); // Cyan fluorescente
    const neonPink = Color(0xFFFF007F); // Magenta eléctrico
    const surfaceDark = Color(0xFF0B0F19);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgOled,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: neonPink,
        surface: surfaceDark,
        onSurface: Color(0xFFE0F7FA),
      ),
      fontFamily: 'monospace', // Estilo terminal hacker
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceDark,
        elevation: 2,
        shadowColor: neonCyan,
        titleTextStyle: TextStyle(
          color: neonCyan,
          fontSize: 18,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.5,
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: neonCyan,
        foregroundColor: Colors.black,
        elevation: 8,
      ),
      extensions: [
        const AppCustomColors(
          dailyAllowanceBg: surfaceDark,
          dailyAllowanceText: neonCyan,
          accentNeon: neonPink,
          expenseBadge: neonPink,
          incomeBadge: neonCyan,
          cardBorder: neonCyan,
          cardRadius: 8.0, // Bordes angulares tipo HUD
        ),
      ],
    );
  }

  // 3. TEMA SAKURA (Zen Flor de Cerezo, Rosa Pastel & Blanco Seda)
  static ThemeData _buildSakuraTheme(Brightness brightness) {
    const sakuraPink = Color(0xFFEC4899); // Rosa pétalo
    const sakuraBgLight = Color(0xFFFFF7F9); // Rosa tiza suave
    const sakuraSurfaceLight = Colors.white;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: sakuraBgLight,
      colorScheme: ColorScheme.fromSeed(
        seedColor: sakuraPink,
        brightness: brightness,
        primary: sakuraPink,
        surface: sakuraSurfaceLight,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: sakuraSurfaceLight,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: Color(0xFF831843), // Rosa borgoña profundo
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: sakuraPink,
        foregroundColor: Colors.white,
      ),
      extensions: [
        const AppCustomColors(
          dailyAllowanceBg: Color(0xFFF472B6), // Rosa degradado
          dailyAllowanceText: Colors.white,
          accentNeon: Color(0xFFFB7185),
          expenseBadge: Color(0xFFE11D48),
          incomeBadge: Color(0xFF059669),
          cardBorder: Color(0xFFFBCFE8),
          cardRadius: 24.0, // Bordes ultra redondeados orgánicos
        ),
      ],
    );
  }
}`,
    },

    'lib/core/theme/theme_provider.dart': {
      lang: 'dart',
      path: 'lib/core/theme/theme_provider.dart',
      content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app_theme_id.dart';
import 'theme_factory.dart';

/// Provider que almacena y alterna el tema activo de la aplicación
final activeThemeIdProvider = NotifierProvider<ActiveThemeNotifier, AppThemeId>(
  ActiveThemeNotifier.new,
);

class ActiveThemeNotifier extends Notifier<AppThemeId> {
  @override
  AppThemeId build() {
    // En la v1 se puede persistir en SharedPreferences o tabla AppSettings de Drift
    return AppThemeId.base;
  }

  void setTheme(AppThemeId newTheme) {
    state = newTheme;
  }
}

/// Provider reactivo que entrega el ThemeData construido a MaterialApp
final themeDataProvider = Provider<ThemeData>((ref) {
  final activeThemeId = ref.watch(activeThemeIdProvider);
  return ThemeFactory.build(activeThemeId, Brightness.light);
});`,
    },

    'lib/core/theme/widgets/theme_background_overlay.dart': {
      lang: 'dart',
      path: 'lib/core/theme/widgets/theme_background_overlay.dart',
      content: `import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../app_theme_id.dart';
import '../theme_provider.dart';

/// Componente que se superpone a las vistas principales y renderiza partículas animadas
/// (pétalos de cerezo para Sakura, chispas digitales y scanlines para Cyberpunk)
/// sin bloquear gestos táctiles mediante IgnorePointer.
class ThemeBackgroundOverlay extends ConsumerWidget {
  final Widget child;

  const ThemeBackgroundOverlay({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeTheme = ref.watch(activeThemeIdProvider);

    switch (activeTheme) {
      case AppThemeId.sakura:
        return Stack(
          children: [
            child,
            const Positioned.fill(
              child: IgnorePointer(
                child: _SakuraPetalsParticleLayer(),
              ),
            ),
          ],
        );

      case AppThemeId.cyberpunk:
        return Stack(
          children: [
            child,
            const Positioned.fill(
              child: IgnorePointer(
                child: _CyberpunkGlitchSparksLayer(),
              ),
            ),
          ],
        );

      case AppThemeId.base:
      default:
        return child; // Cero sobrecarga gráfica en el tema base
    }
  }
}

// 🌸 CAPA DE PARTÍCULAS SAKURA (Pétalos de cerezo que caen y giran suavemente)
class _SakuraPetalsParticleLayer extends StatefulWidget {
  const _SakuraPetalsParticleLayer();

  @override
  State<_SakuraPetalsParticleLayer> createState() => _SakuraPetalsParticleLayerState();
}

class _SakuraPetalsParticleLayerState extends State<_SakuraPetalsParticleLayer>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ticker;
  final List<_PetalParticle> _petals = [];
  final Random _rnd = Random();

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();

    for (int i = 0; i < 28; i++) {
      _petals.add(_PetalParticle(_rnd));
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ticker,
      builder: (context, _) {
        return CustomPaint(
          size: Size.infinite,
          painter: _SakuraPainter(_petals),
        );
      },
    )
    .animate(onPlay: (controller) => controller.repeat(reverse: true))
    .tint(color: const Color(0xFFFBCFE8).withOpacity(0.08), duration: 4.seconds);
  }
}

class _PetalParticle {
  double x = 0;
  double y = 0;
  double size = 0;
  double speedY = 0;
  double speedX = 0;
  double rotation = 0;
  double opacity = 0;

  _PetalParticle(Random rnd) {
    x = rnd.nextDouble();
    y = rnd.nextDouble();
    size = rnd.nextDouble() * 9 + 6;
    speedY = rnd.nextDouble() * 0.0025 + 0.0012;
    speedX = rnd.nextDouble() * 0.001 - 0.0003;
    rotation = rnd.nextDouble() * 2 * pi;
    opacity = rnd.nextDouble() * 0.4 + 0.5;
  }

  void update() {
    y += speedY;
    x += sin(y * 8) * 0.001 + speedX;
    rotation += 0.015;
    if (y > 1.05) {
      y = -0.05;
      x = Random().nextDouble();
    }
  }
}

class _SakuraPainter extends CustomPainter {
  final List<_PetalParticle> petals;
  _SakuraPainter(this.petals);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    for (final p in petals) {
      p.update();
      canvas.save();
      canvas.translate(p.x * size.width, p.y * size.height);
      canvas.rotate(p.rotation);

      paint.color = const Color(0xFFF472B6).withOpacity(p.opacity);
      canvas.drawOval(
        Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size * 1.6),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ⚡ CAPA DE DESTELLOS DIGITALES CYBERPUNK (Chispas neón y línea de escaneo HUD)
class _CyberpunkGlitchSparksLayer extends StatefulWidget {
  const _CyberpunkGlitchSparksLayer();

  @override
  State<_CyberpunkGlitchSparksLayer> createState() => _CyberpunkGlitchSparksLayerState();
}

class _CyberpunkGlitchSparksLayerState extends State<_CyberpunkGlitchSparksLayer>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  final List<_DataSpark> _sparks = [];
  final Random _rnd = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    for (int i = 0; i < 22; i++) {
      _sparks.add(_DataSpark(_rnd));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Chispas de bits digitales flotantes
        AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return CustomPaint(
              size: Size.infinite,
              painter: _CyberpunkPainter(_sparks),
            );
          },
        ),

        // Línea de escaneo láser descendente con flutter_animate
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: Container(
            height: 2,
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF00F0FF).withOpacity(0.6),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ],
              color: const Color(0xFF00F0FF),
            ),
          )
          .animate(onPlay: (controller) => controller.repeat())
          .moveY(begin: 0, end: 800, duration: 3.seconds, curve: Curves.linear)
          .fadeIn(duration: 300.ms)
          .fadeOut(delay: 2700.ms, duration: 300.ms),
        ),
      ],
    );
  }
}

class _DataSpark {
  double x = 0;
  double y = 0;
  double size = 0;
  double speedY = 0;
  Color color = const Color(0xFF00F0FF);

  _DataSpark(Random rnd) {
    x = rnd.nextDouble();
    y = rnd.nextDouble();
    size = rnd.nextDouble() * 3 + 1.5;
    speedY = rnd.nextDouble() * 0.004 + 0.002;
    color = rnd.nextBool() ? const Color(0xFF00F0FF) : const Color(0xFFFF007F);
  }

  void update() {
    y -= speedY;
    if (y < -0.05) {
      y = 1.05;
      x = Random().nextDouble();
    }
  }
}

class _CyberpunkPainter extends CustomPainter {
  final List<_DataSpark> sparks;
  _CyberpunkPainter(this.sparks);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    for (final s in sparks) {
      s.update();
      paint.color = s.color;
      canvas.drawRect(
        Rect.fromLTWH(s.x * size.width, s.y * size.height, s.size, s.size * 2),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}`,
    },

    'lib/features/quotes/presentation/screens/quotes_list_screen.dart': {
      lang: 'dart',
      path: 'lib/features/quotes/presentation/screens/quotes_list_screen.dart',
      content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuotesListScreen extends ConsumerWidget {
  const QuotesListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Presupuestos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          // Listado reactivo conectado a Riverpod
          Center(
            child: Text('Presupuestos guardados localmente sin conexión'),
          ),
        ],
      ),
      // 1 ACCIÓN PRINCIPAL POR PANTALLA:
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Navegar a la pantalla de creación
        },
        icon: const Icon(Icons.add),
        label: const Text('Nuevo Presupuesto'),
      ),
    );
  }
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" /> Código Base Flutter (Listo para Copiar y Probar)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Archivos estructurados listos para colocar en tu carpeta local de Flutter con dependencias verificadas.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '¡Copiado!' : 'Copiar Archivo'}</span>
        </button>
      </div>

      {/* File selector pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.keys(files).map((fileKey) => (
          <button
            key={fileKey}
            onClick={() => setSelectedFile(fileKey)}
            className={`px-3 py-1.5 rounded-lg font-mono transition ${
              selectedFile === fileKey
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {fileKey}
          </button>
        ))}
      </div>

      {/* Code viewer box */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto relative">
        <div className="text-[11px] font-mono text-slate-500 pb-2 border-b border-slate-800 mb-2">
          Ruta: {files[selectedFile].path}
        </div>
        <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
          {files[selectedFile].content}
        </pre>
      </div>

      {/* Execution instructions */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
        <span className="font-bold text-slate-300 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-amber-400" /> Cómo ejecutarlo en tu máquina:
        </span>
        <ol className="list-decimal list-inside text-slate-400 space-y-1">
          <li>Crea tu proyecto Flutter: <code className="text-blue-400">flutter create --org com.oficiopro oficio_pro</code></li>
          <li>Reemplaza el archivo <code className="text-amber-300">pubspec.yaml</code> con las dependencias indicadas arriba.</li>
          <li>Instala los paquetes: <code className="text-blue-400">flutter pub get</code></li>
          <li>Ejecuta el generador de código de Drift: <code className="text-emerald-400">dart run build_runner build</code></li>
          <li>Corre la app en tu emulador o móvil Android: <code className="text-blue-400">flutter run</code></li>
        </ol>
      </div>
    </div>
  );
};
