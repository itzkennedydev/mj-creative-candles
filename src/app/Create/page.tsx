"use client";

import React, { useEffect } from 'react';
import { Container } from '~/components/ui/container'; // Import the Container component

// Define types for the InkSoft API
declare global {
  interface Window {
    inksoftApi?: {
      launchEmbeddedDesignStudio: (config: {
        targetElementId: string;
        domain: string;
        cdnDomain: string;
        storeUri: string;
      }) => void;
    };
  }
}

const CreatePage = () => {
  useEffect(() => {
    function init() {
      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.async = true;
      scriptElement.src = 'https://cdn.inksoft.com/FrontendApps/storefront/assets/scripts/designer-embed.js';
      scriptElement.onload = function() { launchDesignStudio() };
      document.getElementsByTagName('body')[0]?.appendChild(scriptElement);
    }

    function launchDesignStudio() {
      if (window.inksoftApi) {
        window.inksoftApi.launchEmbeddedDesignStudio({
          targetElementId: 'inksoftEmbed',
          domain: 'https://stores.inksoft.com',
          cdnDomain: 'https://cdn.inksoft.com',
          storeUri: 'DS845830814'
        });
      } else {
        console.error('inksoftApi is not available on the window object.');
      }
    }

    init();
  }, []);

  return (
    <Container className="p-0"> {/* Use the Container component and remove extra padding */}
      <div className="embed-container">
        <div id="inksoftEmbed" style={{ width: '100%', height: '720px', padding: 0, margin: 0, border: 0, maxHeight: '100%' }}></div>
      </div>
    </Container>
  );
};

export default CreatePage;
