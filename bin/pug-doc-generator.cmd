@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\pug-doc-generator\bin\pug-doc-generator" %*
) ELSE (
  node  "%~dp0\node_modules\pug-doc-generator\bin\pug-doc-generator" %*
)