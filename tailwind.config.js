/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      primary: '#CCFE00',
      info_email: '#0B8FAC',
      eventWarningTxt: '#F97433',
      eventGoalTxt:"#1cff03",
      eventFoulTxt:"#F02525",
      septenary: '#CC3F08',
      white: '#FFFFFF',
      black: '#121212',
      gray: '#3a3a3a',
      transparent: '#ffffff00',
      darkBlue:'#020647',
      darkBlueEventCard:'#081B35',
      borderEventCard:'#21354E',
      lightGreen:'#1cff03',
      red:'#F02525',
      listingRed:'#FF2929',
      listingyellow:'#F2D644',
      grayReferee:'#757575B2',
      labeBackBlue:'#06182c',
      iconGray:'#FFFFFF30',
      background:"#130f2e",
      btn_txt:"#000000",
    },
    fontFamily: {
      'roboto-light': ['RobotoCondensed-Light', 'sans-serif'],
      'roboto-regular': ['RobotoCondensed-Regular', 'sans-serif'],
      'roboto-medium': ['RobotoCondensed-Medium', 'sans-serif'],
      'roboto-bold': ['RobotoCondensed-Bold', 'sans-serif'],
      'teko-semibold': ['Teko-SemiBold', 'sans-serif'],
      'teko-regular': ['Teko-Regular', 'sans-serif'],
      'teko-medium': ['Teko-Medium', 'sans-serif'],
      'teko-light': ['Teko-Light', 'sans-serif'],
      'teko-bold': ['Teko-Bold', 'sans-serif'],
    },
    extend: {
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      colors: {
        Gray: {
          400: '#9ca3af',
          600: '#4b5563',
        },
      },
    },
  },
  plugins: [],
};