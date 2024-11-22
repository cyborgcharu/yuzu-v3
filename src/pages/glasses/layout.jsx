// src/pages/glasses/layout.jsx
import React from 'react';

const GlassesLayout = ({ children }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Yuzu Meet - Glasses Display</title>
      </head>
      <body className="bg-transparent m-0 p-0">
        {children}
      </body>
    </html>
  );
};

export default GlassesLayout;