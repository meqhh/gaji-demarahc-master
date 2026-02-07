import React, { Suspense, lazy } from 'react';

/**
 * Component mapper - Maps component names to actual React components
 * Add all your page components here
 */
const componentMap = {
  // Admin Components
  'DashboardAdmin': lazy(() => import('../Admin/Dashboard')),
  'Karyawan': lazy(() => import('../Admin/Karyawan')),
  'AbsensiAdmin': lazy(() => import('../Admin/Absensi')),
  'CutiKaryawan': lazy(() => import('../Admin/CutiKaryawan')),
  'Gaji': lazy(() => import('../Admin/Gaji')),
  'SlipGajiAdmin': lazy(() => import('../Admin/SlipGaji')),
  'Treatment': lazy(() => import('../Admin/Treatment')),
  'AdminProfileSettings': lazy(() => import('../Pages/AdminProfileSettings')),
  'AdminSecurity': lazy(() => import('../Pages/AdminSecurity')),
  'AdminHelp': lazy(() => import('../Pages/AdminHelp')),

  // Karyawan Components
  'DashboardKaryawan': lazy(() => import('../Karyawan/DashboardKaryawan')),
  'DataDiri': lazy(() => import('../Karyawan/DataDiri')),
  'AbsensiKaryawan': lazy(() => import('../Karyawan/AbsensiKaryawan')),
  'SlipGajiKaryawan': lazy(() => import('../Karyawan/SlipgajiKaryawan')),
  'CutiKaryawan': lazy(() => import('../Karyawan/CutiKaryawan')),
  'KaryawanProfileSettings': lazy(() => import('../Pages/KaryawanProfileSettings')),
  'KaryawanSecurity': lazy(() => import('../Pages/KaryawanSecurity')),
  'KaryawanHelp': lazy(() => import('../Pages/KaryawanHelp'))
};

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">Memuat halaman...</p>
    </div>
  </div>
);

/**
 * Error fallback component
 */
const ErrorFallback = ({ error, componentName }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-red-50 p-6 rounded-lg max-w-md">
      <h2 className="text-red-800 font-bold mb-2">Gagal Memuat Komponen</h2>
      <p className="text-red-700 mb-4">
        Komponen '{componentName}' tidak dapat dimuat.
      </p>
      <p className="text-red-600 text-sm">{error?.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Muat Ulang Halaman
      </button>
    </div>
  </div>
);

/**
 * Component not found fallback
 */
const ComponentNotFound = ({ componentName }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-yellow-50 p-6 rounded-lg max-w-md">
      <h2 className="text-yellow-800 font-bold mb-2">Komponen Tidak Ditemukan</h2>
      <p className="text-yellow-700">
        Komponen '{componentName}' belum didaftarkan dalam sistem.
      </p>
      <p className="text-yellow-600 text-sm mt-2">
        Hubungi administrator untuk menambahkan komponen ini.
      </p>
    </div>
  </div>
);

/**
 * Dynamic Component Renderer
 * Renders components based on component name from menu config
 */
export const DynamicComponentRenderer = ({ 
  componentName, 
  props = {},
  fallback = <LoadingFallback />
}) => {
  // Validate component name
  if (!componentName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700">Nama komponen tidak ditemukan</p>
        </div>
      </div>
    );
  }

  // Check if component exists in map
  if (!componentMap[componentName]) {
    console.warn(`Component not found: ${componentName}`);
    return <ComponentNotFound componentName={componentName} />;
  }

  const Component = componentMap[componentName];

  try {
    return (
      <Suspense fallback={fallback}>
        <ErrorBoundary componentName={componentName}>
          <Component {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  } catch (error) {
    console.error(`Error rendering component ${componentName}:`, error);
    return <ErrorFallback error={error} componentName={componentName} />;
  }
};

/**
 * Error Boundary for component errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          componentName={this.props.componentName} 
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Get available components list
 */
export const getAvailableComponents = () => {
  return Object.keys(componentMap);
};

/**
 * Register custom component
 * Use this to add custom components at runtime
 */
export const registerComponent = (componentName, Component) => {
  componentMap[componentName] = lazy(() => 
    Promise.resolve({ default: Component })
  );
};

/**
 * Check if component is registered
 */
export const isComponentRegistered = (componentName) => {
  return componentName in componentMap;
};

/**
 * Lazy load component by name
 */
export const getComponentByName = (componentName) => {
  if (!componentMap[componentName]) {
    console.warn(`Component not found: ${componentName}`);
    return null;
  }
  return componentMap[componentName];
};

export default DynamicComponentRenderer;
