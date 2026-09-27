export default function tinaDirective() {
  return {
    name: 'tina-directive',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({
          name: 'tina',
          entrypoint: './astro-tina-directive/client-tina.mjs',
        });
      },
    },
  };
}
