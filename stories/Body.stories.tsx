import type { Meta, StoryObj } from '@storybook/react';
import Body, { ExtendedBodyPart, Slug } from '../index';

const meta = {
  title: 'Components/Body',
  component: Body,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 
          'Interactive SVG body diagram with muscle part highlighting. Supports different colors for left and right sides using the `side` property.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'radio', options: ['front', 'back'] },
    gender: { control: 'radio', options: ['male', 'female'] },
    colors: { table: { disable: true } },
    scale: { control: 'number', min: 0.5, max: 2, step: 0.1 },
    defaultFill: { control: 'color' },
  },
} satisfies Meta<typeof Body>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleColors = ['#ff6b6b', '#feca57', '#1dd1a1', '#5f27cd'];

export const Default: Story = {
  args: {
    data: [] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
};

export const SingleMuscle: Story = {
  args: {
    data: [
      { slug: 'chest' as Slug, intensity: 2 }
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Basic usage - same color for both sides (backward compatible). Using `intensity` maps to the `colors` array.',
      },
    },
  },
};

export const MultipleMuscles: Story = {
  args: {
    data: [
      { slug: 'chest' as Slug, intensity: 2 },
      { slug: 'biceps' as Slug, intensity: 1 },
      { slug: 'shoulders' as Slug, intensity: 3 },
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Multiple muscle groups highlighted with different intensity levels. Higher intensity = more severe color.',
      },
    },
  },
};


export const SideSpecificColors: Story = {
  args: {
    data: [
      { slug: 'biceps' as Slug, side: 'left', color: '#ff0000' } as ExtendedBodyPart,
      { slug: 'biceps' as Slug, side: 'right', color: '#00ff00' } as ExtendedBodyPart,
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Different colors for left and right sides using the `side` property. Use separate entries with `side: "left"` or `side: "right"`.',
      },
    },
  },
};

export const SideSpecificIntensity: Story = {
  args: {
    data: [
      { slug: 'quadriceps' as Slug, side: 'left', intensity: 1 } as ExtendedBodyPart,
      { slug: 'quadriceps' as Slug, side: 'right', intensity: 3 } as ExtendedBodyPart,
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Different intensity levels per side. Intensity maps to the `colors` array (1-indexed). Left quads mild (level 1), right quads severe (level 3).',
      },
    },
  },
};

export const MixedUsage: Story = {
  args: {
    data: [
      { slug: 'chest' as Slug, intensity: 2 } as ExtendedBodyPart,
      { slug: 'biceps' as Slug, side: 'left', color: '#ff0000' } as ExtendedBodyPart,
      { slug: 'biceps' as Slug, side: 'right', color: '#00ff00' } as ExtendedBodyPart,
      { slug: 'quadriceps' as Slug, side: 'left', intensity: 1 } as ExtendedBodyPart,
      { slug: 'quadriceps' as Slug, side: 'right', intensity: 3 } as ExtendedBodyPart,
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Combining different approaches: backward compatible (chest), direct colors per side (biceps), and intensity per side (quadriceps).',
      },
    },
  },
};

export const AllViews: Story = {
  render: (args) => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: '40px',
      padding: '20px'
    }}>
      <div>
        <h3>Male Front</h3>
        <Body {...args} side="front" gender="male" />
      </div>
      <div>
        <h3>Male Back</h3>
        <Body {...args} side="back" gender="male" />
      </div>
      <div>
        <h3>Female Front</h3>
        <Body {...args} side="front" gender="female" />
      </div>
      <div>
        <h3>Female Back</h3>
        <Body {...args} side="back" gender="female" />
      </div>
    </div>
  ),
  args: {
    data: [
      { slug: 'chest' as Slug, intensity: 2 } as ExtendedBodyPart,
      { slug: 'biceps' as Slug, side: 'left', color: '#ff0000' } as ExtendedBodyPart,
      { slug: 'biceps' as Slug, side: 'right', color: '#00ff00' } as ExtendedBodyPart,
      { slug: 'quadriceps' as Slug, side: 'left', intensity: 1 } as ExtendedBodyPart,
      { slug: 'quadriceps' as Slug, side: 'right', intensity: 3 } as ExtendedBodyPart,
    ] as ExtendedBodyPart[],
    colors: sampleColors,
  },
  parameters: {
    docs: {
      description: {
        story: 
          'All four views at once showing different genders and body sides. Use the controls to customize.',
      },
    },
  },
};

export const DisabledParts: Story = {
  args: {
    data: [
      { slug: 'chest' as Slug, intensity: 2 },
      { slug: 'biceps' as Slug, intensity: 1 },
    ] as ExtendedBodyPart[],
    disabledParts: ['biceps'] as Slug[],
    side: 'front',
    gender: 'male',
    colors: ['#ff6b6b', '#feca57'],
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Using `disabledParts` to disable click interactions on specific muscle groups. Disabled parts appear with reduced opacity.',
      },
    },
  },
};

export const WithCustomColors: Story = {
  args: {
    data: [
      { slug: 'deltoids' as Slug, intensity: 1 } as ExtendedBodyPart,
      { slug: 'triceps' as Slug, intensity: 2 } as ExtendedBodyPart,
      { slug: 'forearm' as Slug, intensity: 3 } as ExtendedBodyPart,
    ] as ExtendedBodyPart[],
    side: 'back',
    gender: 'male',
    colors: ['#ff4757', '#ffa502', '#2ed573'],
    defaultFill: '#6c5ce7',
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Custom color scheme using the `colors` array property. Also shows custom `defaultFill` for non-highlighted parts.',
      },
    },
  },
};

export const WithClickEvents: Story = {
  args: {
    data: [
      { slug: 'abs' as Slug, intensity: 2 },
      { slug: 'obliques' as Slug, intensity: 1 },
    ] as ExtendedBodyPart[],
    side: 'front',
    gender: 'male',
    colors: sampleColors,
    onBodyPartPress: (part: ExtendedBodyPart, side?: 'left' | 'right') => {
      console.log(`Clicked muscle: ${part?.slug || part.color}, side: ${side}`);
      alert(`Clicked: ${part.slug} ${side ? `- ${side} side` : ''}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 
          'Using `onBodyPartPress` to handle click events. Click on any highlighted muscle to see the alert.',
      },
    },
  },
};
