param([string]$BootstrapScript = "$PSScriptRoot\projectxir-portable-bootstrap.py")
$ErrorActionPreference='Stop'
$blender='C:\Users\Wisdom\OneDrive\Documents\Mortal Coil Tools\blender-2.92.0-windows64\blender.exe'
$root='C:\Users\Wisdom\Documents\Codex\Mortal Coil Tools\blender-user'
$env:APPDATA="$root\\appdata"; $env:BLENDER_USER_CONFIG="$root\config"; $env:BLENDER_USER_SCRIPTS="$root\scripts"; $env:BLENDER_USER_DATAFILES="$root\datafiles"
& $blender --background --factory-startup --python $BootstrapScript
