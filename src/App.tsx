import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UploadArea from './components/UploadArea';
import ImagePreview from './components/ImagePreview';
import UpscaleOptions from './components/UpscaleOptions';
import ScanningModal from './components/ScanningModal';

function AppContent() {
  const { isScanningModalOpen, closeScanningModal, scanningImageName, images } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Enhance Your Images</h1>
            <p className="text-gray-600 mb-6">
              Upload an image and use our AI to upscale and enhance it with just a few clicks.
            </p>
            
            {images.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <UploadArea />
              </div>
            ) : (
              <>
                <ImagePreview />
                <UpscaleOptions />
              </>
            )}
          </div>
        </main>
      </div>
      
      <ScanningModal 
        isOpen={isScanningModalOpen}
        onClose={closeScanningModal}
        imageName={scanningImageName}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;