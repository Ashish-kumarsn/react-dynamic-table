// src/components/BulkSelect.tsx
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

type Props = {
  value: number;
  onChange: (n: number) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export default function BulkSelect({ value, onChange, onSubmit, loading }: Props) {
  return (
    <div className="bulk-select-container">
      <InputText
        value={value.toString()}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder="Select rows..."
        className="bulk-input"
      />
      <Button label="Submit" onClick={onSubmit} loading={loading} className="bulk-btn" />

      {/* Responsive styling */}
      <style>
        {`
          .bulk-select-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
            width: 100%;
            max-width: 250px;
          }

          .bulk-input {
            width: 100%;
          }

          .bulk-btn {
            width: 100%;
          }

          @media (max-width: 480px) {
            .bulk-select-container {
              max-width: 100%;
            }
            .bulk-btn {
              font-size: 12px !important;
              padding: 6px 8px !important;
            }
            .bulk-input {
              font-size: 12px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
