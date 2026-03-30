/** @type {import('tailwindcss').Config} */
const { blue } = require("tailwindcss/colors");

module.exports = {
  // 内容扫描路径
  content: [
    "./layouts/**/*.{html,js}",
    "./content/**/*.{md,html}"
  ],
  
  // 深色模式配置
  darkMode: 'class',
  
  // 主题配置
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        primary: blue[700],
        'primary-light': blue[700],
        'primary-dark': blue[200],
      },
      
      // 排版配置
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            maxWidth: 'none',
            
            // 链接样式
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary-dark'),
              },
            },
            
            // 标题样式
            'h2, h3, h4, h5, h6': {
              color: theme('colors.gray.900'),
            },
            
            // 代码块样式
            pre: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.100'),
            },
            
            // 行内代码样式
            code: {
              color: theme('colors.primary'),
              backgroundColor: theme('colors.gray.100'),
              padding: '0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
          },
        },
        
        // 深色模式排版
        dark: {
          css: {
            color: theme('colors.gray.200'),
            
            // 链接样式
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.300'),
              },
            },
            
            // 标题样式
            'h2, h3, h4, h5, h6': {
              color: theme('colors.gray.100'),
            },
            
            // 代码块样式
            pre: {
              backgroundColor: theme('colors.gray.900'),
            },
            
            // 行内代码样式
            code: {
              color: theme('colors.blue.400'),
              backgroundColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  
  // 插件配置
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
