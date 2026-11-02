// The neo-brutalist look carried over from the Expo prototype: flat bright
// fills, thick black outlines and hard offset shadows.
export const colors = {
  ink: '#111111',
  background: '#e9e9eb',
  surface: '#ffffff',
  muted: '#555555',
  blue: '#27a6fd',
  yellow: '#feda00',
  pink: '#fc55aa',
  green: '#5dd76d',
  sky: '#8ad8f5',
  purple: '#6553fd',
  danger: '#e5383b',
};

// Card fills cycle through these.
export const cardColors = [
  colors.yellow,
  colors.green,
  colors.pink,
  colors.blue,
];

export const fonts = {
  regular: 'Outfit-Regular',
  semibold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
};

export const border = {
  borderWidth: 3,
  borderColor: colors.ink,
};

export const hardShadow = {
  shadowColor: colors.ink,
  shadowOpacity: 1,
  shadowRadius: 0,
  shadowOffset: { width: 4, height: 4 },
  elevation: 4,
};
