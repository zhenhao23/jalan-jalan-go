# People Marker Feature

This feature replaces the red location marker on the map with a 3D animated people model.

## Components Created

### 1. `src/components/People.tsx`

- Renders the 3D people.fbx model using Three.js
- Creates a transparent container with the animated 3D model
- Optimized for small marker size (60x60px)
- Features gentle rotation animation

### 2. `src/components/People.css`

- Styles for the people marker container
- Transparent background with subtle glow effect
- Responsive design for mobile devices
- Ensures the marker appears above the map

### 3. `src/components/PeopleMarker.tsx`

- Wrapper component that integrates the People component with Mapbox GL
- Creates a custom HTML element for the marker
- Handles marker positioning and cleanup
- Uses React 18's createRoot for rendering

## How It Works

1. **Map Integration**: The `Map.tsx` component now uses `PeopleMarker` instead of the default red marker
2. **3D Model**: The people.fbx model is loaded and rendered in a transparent container
3. **Positioning**: The marker follows the user's GPS location in real-time
4. **Animation**: The 3D model gently rotates to add visual interest

## Files Modified

- `src/Map.tsx`: Removed red marker creation, added PeopleMarker component
- `src/Food.tsx`: Fixed FBXLoader import path

## Features

- ✅ Transparent background (overlays on map)
- ✅ 3D animated people model
- ✅ Real-time GPS tracking
- ✅ Responsive design
- ✅ Proper cleanup and memory management
- ✅ Gentle rotation animation

## Technical Details

- Uses Three.js for 3D rendering
- FBXLoader for loading the people.fbx model
- Mapbox GL for map integration
- React 18 createRoot for component rendering
- TypeScript for type safety

## Usage

The People marker automatically appears when:

1. The map loads successfully
2. User grants location permissions
3. GPS location is available

The marker will follow the user's movement in real-time, replacing the previous red marker with an animated 3D character.
