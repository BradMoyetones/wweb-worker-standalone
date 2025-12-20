Var CheckboxDesktop

!macro customFinishPage
  # Usamos las coordenadas estándar de la página de finalización de NSIS
  ${NSD_CreateCheckbox} 120u 110u 180u 10u "Crear acceso directo en el escritorio"
  Pop $CheckboxDesktop
  ${NSD_Check} $CheckboxDesktop
!macroend

!macro customFinishPageLeave
  ${NSD_GetState} $CheckboxDesktop $0
  ${If} $0 == ${BST_CHECKED}
    # Creamos el acceso directo
    # $INSTDIR es la carpeta de instalación, $DESKTOP es el escritorio del usuario
    CreateShortCut "$DESKTOP\${PRODUCT_FILENAME}.lnk" "$INSTDIR\${APP_FILENAME}.exe"
  ${EndIf}
!macroend