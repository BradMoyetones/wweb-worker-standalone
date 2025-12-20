# 1. Definimos la variable para el checkbox (debe estar fuera de los macros)
Var CheckboxDesktop

# 2. Macro para inyectar el checkbox en la página final
!macro customFinishPage
  # Creamos el checkbox en las coordenadas especificadas
  ${NSD_CreateCheckbox} 120u 140u 150u 10u "Crear acceso directo en el escritorio"
  Pop $CheckboxDesktop
  
  # Lo marcamos por defecto
  ${NSD_Check} $CheckboxDesktop
!macroend

# 3. Macro para ejecutar la acción cuando el usuario cierra el instalador
!macro customFinishPageLeave
  # Revisamos el estado del checkbox
  ${NSD_GetState} $CheckboxDesktop $0
  
  # Si está marcado ($0 == 1), creamos el acceso directo
  ${if} $0 == ${BST_CHECKED}
    # Usamos las variables de entorno de electron-builder
    CreateShortCut "$DESKTOP\${productName}.lnk" "$INSTDIR\${executableName}.exe"
  ${endif}
!macroend