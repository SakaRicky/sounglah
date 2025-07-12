import React from 'react';
import { StatCard } from '@/components/atoms/StatCard';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

export const StatCardTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      background: 'var(--color-beige-0)', 
      minHeight: '100vh',
      fontFamily: 'Georgia, serif'
    }}>
      <h1 style={{ color: 'var(--color-brown-9)', marginBottom: '2rem' }}>
        Enhanced StatCard Test
      </h1>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-brown-8)', marginBottom: '1.5rem' }}>
          Different Types
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            icon={<TranslateIcon />}
            label="Total Translations"
            value="1,247"
            type="default"
            ariaLabel="Total translations statistic"
          />
          
          <StatCard
            icon={<CheckCircleIcon />}
            label="Approved"
            value="892"
            type="success"
            ariaLabel="Approved translations statistic"
          />
          
          <StatCard
            icon={<WarningIcon />}
            label="Pending Review"
            value="234"
            type="warning"
            ariaLabel="Pending review translations statistic"
          />
          
          <StatCard
            icon={<ErrorIcon />}
            label="Rejected"
            value="121"
            type="error"
            ariaLabel="Rejected translations statistic"
          />
          
          <StatCard
            icon={<InfoIcon />}
            label="Languages"
            value="12"
            type="info"
            ariaLabel="Supported languages statistic"
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-brown-8)', marginBottom: '1.5rem' }}>
          With Trend Indicators
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            icon={<TrendingUpIcon />}
            label="Weekly Growth"
            value="+15%"
            type="success"
            trend="up"
            ariaLabel="Weekly growth trend statistic"
          />
          
          <StatCard
            icon={<TrendingDownIcon />}
            label="Error Rate"
            value="-8%"
            type="error"
            trend="down"
            ariaLabel="Error rate trend statistic"
          />
          
          <StatCard
            icon={<RemoveIcon />}
            label="Stable Metrics"
            value="0%"
            type="info"
            trend="neutral"
            ariaLabel="Stable metrics statistic"
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-brown-8)', marginBottom: '1.5rem' }}>
          Performance Metrics
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Accuracy Rate"
            value="98.5%"
            type="success"
            trend="up"
            ariaLabel="Translation accuracy rate"
          />
          
          <StatCard
            icon={<WarningIcon />}
            label="Response Time"
            value="2.3s"
            type="warning"
            ariaLabel="Average response time"
          />
          
          <StatCard
            icon={<InfoIcon />}
            label="Active Users"
            value="1,847"
            type="info"
            trend="up"
            ariaLabel="Active users count"
          />
          
          <StatCard
            icon={<TranslateIcon />}
            label="Daily Translations"
            value="156"
            type="default"
            ariaLabel="Daily translation count"
          />
        </div>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '12px',
        border: '2px solid var(--color-brown-3)'
      }}>
        <h3 style={{ color: 'var(--color-brown-8)', marginBottom: '1rem' }}>
          Enhanced Features:
        </h3>
        <ul style={{ color: 'var(--color-brown-7)', lineHeight: '1.6' }}>
          <li>✅ <strong>Type-Specific Styling:</strong> Different colors and gradients for each type</li>
          <li>✅ <strong>Trend Indicators:</strong> Animated arrows showing up/down/neutral trends</li>
          <li>✅ <strong>Hover Effects:</strong> Smooth lift animation and icon scaling</li>
          <li>✅ <strong>Gradient Backgrounds:</strong> Subtle color-coded gradients</li>
          <li>✅ <strong>Enhanced Borders:</strong> Type-specific colored borders</li>
          <li>✅ <strong>Icon Containers:</strong> Circular containers with colored backgrounds</li>
          <li>✅ <strong>Label Badges:</strong> Styled badges for labels</li>
          <li>✅ <strong>Pattern Overlays:</strong> Subtle background patterns</li>
          <li>✅ <strong>Mobile Responsive:</strong> Optimized for all screen sizes</li>
          <li>✅ <strong>Accessibility:</strong> ARIA labels and screen reader support</li>
        </ul>
      </div>
    </div>
  );
}; 