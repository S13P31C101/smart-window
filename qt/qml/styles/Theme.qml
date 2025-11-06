pragma Singleton
import QtQuick 2.15

QtObject {
    id: theme

    // ========================================================================
    // Color Palette - Slate Minimal Design
    // ========================================================================

    // Primary colors - Cyan/Blue accents
    readonly property color primary: "#22d3ee"      // cyan-400
    readonly property color primaryLight: "#67e8f9" // cyan-300
    readonly property color primaryDark: "#06b6d4"  // cyan-500
    readonly property color accent: "#60a5fa"       // blue-400
    readonly property color accentLight: "#93c5fd"  // blue-300

    // Background colors (Slate Dark theme)
    readonly property color backgroundDark: "#020617"   // slate-950
    readonly property color backgroundMid: "#0f172a"    // slate-900
    readonly property color backgroundLight: "#1e293b"  // slate-800

    // Glass effect colors (subtle opacity)
    readonly property color glassBackground: "#1AFFFFFF"
    readonly property color glassBackgroundMid: "#26FFFFFF"
    readonly property color glassBorder: "#ffffff18"

    // Text colors - Slate scale
    readonly property color textPrimary: "#e2e8f0"   // slate-200
    readonly property color textSecondary: "#94a3b8" // slate-400
    readonly property color textTertiary: "#64748b"  // slate-500
    readonly property color textDisabled: "#475569"  // slate-600

    // Status colors
    readonly property color success: "#4ECDC4"
    readonly property color warning: "#FFE66D"
    readonly property color error: "#FF6B6B"
    readonly property color info: "#4A90E2"

    // Widget colors
    readonly property color clockWidget: "#1A4A7E"
    readonly property color weatherWidget: "#2A5A8E"
    readonly property color spotifyWidget: "#1DB954"
    readonly property color quoteWidget: "#6B5B95"

    // ========================================================================
    // Typography
    // ========================================================================

    readonly property string fontFamily: "Inter"
    readonly property string fontFamilyDisplay: "Montserrat"

    readonly property int fontSizeH1: 48
    readonly property int fontSizeH2: 36
    readonly property int fontSizeH3: 28
    readonly property int fontSizeH4: 24
    readonly property int fontSizeBody: 16
    readonly property int fontSizeCaption: 14
    readonly property int fontSizeSmall: 12

    readonly property int fontWeightLight: 300
    readonly property int fontWeightRegular: 400
    readonly property int fontWeightMedium: 500
    readonly property int fontWeightBold: 700

    // ========================================================================
    // Spacing
    // ========================================================================

    readonly property int spacingXs: 4
    readonly property int spacingS: 8
    readonly property int spacingM: 16
    readonly property int spacingL: 24
    readonly property int spacingXl: 32
    readonly property int spacingXxl: 48

    readonly property int paddingS: 12
    readonly property int paddingM: 20
    readonly property int paddingL: 32

    // ========================================================================
    // Border & Corner Radius (Glassmorphism style)
    // ========================================================================

    readonly property int radiusS: 12
    readonly property int radiusM: 18
    readonly property int radiusL: 24
    readonly property int radiusXl: 32
    readonly property int radiusRound: 999

    readonly property int borderWidthThin: 1
    readonly property int borderWidthMedium: 2
    readonly property int borderWidthThick: 3

    // ========================================================================
    // Effects (Glassmorphism blur & shadows)
    // ========================================================================

    readonly property real opacityDisabled: 0.4
    readonly property real opacityHover: 0.9
    readonly property real opacityPressed: 0.7

    // Glassmorphism blur: 18-24px range
    readonly property real blurRadiusSmall: 18
    readonly property real blurRadiusMedium: 24
    readonly property real blurRadiusLarge: 40

    // Enhanced shadows
    readonly property real shadowOpacity: 0.3
    readonly property real shadowRadius: 24
    readonly property int shadowOffsetY: 8

    // ========================================================================
    // Animation
    // ========================================================================

    readonly property int animationFast: 150
    readonly property int animationNormal: 300
    readonly property int animationSlow: 500

    readonly property int easingType: Easing.OutCubic

    // ========================================================================
    // Layout (9:16 Portrait Display)
    // ========================================================================

    readonly property int screenWidth: 1080
    readonly property int screenHeight: 1920

    readonly property int gridColumns: 6
    readonly property int gridGutter: 20

    readonly property int headerHeight: 100
    readonly property int footerHeight: 80

    // ========================================================================
    // Widget Defaults
    // ========================================================================

    readonly property int widgetMinWidth: 200
    readonly property int widgetMinHeight: 150
    readonly property int widgetMaxWidth: 400
    readonly property int widgetMaxHeight: 300

    readonly property int cursorSize: 48

    // ========================================================================
    // Gesture
    // ========================================================================

    readonly property int gestureThreshold: 50
    readonly property int gestureTimeout: 500

    // ========================================================================
    // Helper Functions
    // ========================================================================

    function alpha(color, opacity) {
        return Qt.rgba(color.r, color.g, color.b, opacity)
    }

    function lighten(color, factor) {
        return Qt.lighter(color, 1 + factor)
    }

    function darken(color, factor) {
        return Qt.darker(color, 1 + factor)
    }

    function dpScale(value) {
        // Scale for different display densities
        return value * 1.0  // Can be adjusted for device
    }
}
