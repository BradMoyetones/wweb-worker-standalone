# Este macro se ejecuta al finalizar la instalación
!macro customFinishPage
  # Añadimos un checkbox: (Coordenadas x, y, ancho, alto, texto)
  ${NSD_CreateCheckbox} 120u 140u 150u 10u "Crear acceso directo en el escritorio"
  Pop $CheckboxDesktop
  # Lo marcamos por defecto (opcional)
  ${NSD_Check} $CheckboxDesktop
!macroend

# Esta función se ejecuta cuando el usuario le da a "Terminar"
!macro customFinishPageLeave
  ${NSD_GetState} $CheckboxDesktop $0
  ${if} $0 == ${BST_CHECKED}
    # Creamos el acceso directo manualmente
    CreateShortCut "$DESKTOP\${productName}.lnk" "$INSTDIR\${executableName}.exe"
  ${endif}
!macroend