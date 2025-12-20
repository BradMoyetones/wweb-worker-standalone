# 1. Definimos la variable
Var CheckboxDesktop

# 2. Obligamos al compilador a registrar la variable para evitar el warning 6001
!appendfile "${NSISDIR}\nsisconf.nsh" ""

# 3. Macro para inyectar el checkbox en la página final
!macro customFinishPage
  # El componente se crea solo si la página de finalización está activa
  ${NSD_CreateCheckbox} 120u 140u 150u 10u "Crear acceso directo en el escritorio"
  Pop $CheckboxDesktop
  ${NSD_Check} $CheckboxDesktop
!macroend

# 4. Macro para ejecutar la acción al salir
!macro customFinishPageLeave
  # Si por alguna razón la variable es nula, no hacemos nada (evita errores de ejecución)
  ${If} $CheckboxDesktop != 0
    ${NSD_GetState} $CheckboxDesktop $0
    ${If} $0 == ${BST_CHECKED}
      # Usamos las variables que ya definiste en el YAML
      CreateShortCut "$DESKTOP\${PRODUCT_FILENAME}.lnk" "$INSTDIR\${APP_FILENAME}.exe"
    ${EndIf}
  ${EndIf}
!macroend