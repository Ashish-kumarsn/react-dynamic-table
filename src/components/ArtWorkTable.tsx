// src/components/ArtworkTable.tsx
import React, { useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import type { Artwork } from "../types";
import BulkSelect from "./BulkSelect";

type Props = {
  data: Artwork[];
  selectedIds: Set<number>;
  onSelectionChange: (selected: Artwork[]) => void;
  loading?: boolean;

  // new props for bulk + clear
  bulkNumber: number;
  setBulkNumber: (n: number) => void;
  onBulkSelect: () => void;
  bulkLoading: boolean;
  onClearAll: () => void;
};

export default function ArtworkTable({
  data,
  selectedIds,
  onSelectionChange,
  loading = false,
  bulkNumber,
  setBulkNumber,
  onBulkSelect,
  bulkLoading,
  onClearAll,
}: Props) {
  const currentSelection = React.useMemo(
    () => data.filter((r) => selectedIds.has(r.id)),
    [data, selectedIds]
  );

  const op = useRef<OverlayPanel>(null);

  // Custom header for Title column with overlay trigger
  const titleHeader = (
    <div className="title-header">
      <span>Title</span>
      <Button
        icon="pi pi-chevron-down"
        rounded
        text
        severity="secondary"
        onClick={(e) => op.current?.toggle(e)}
        aria-label="Bulk actions"
      />

      {/* Overlay with Bulk + ClearAll */}
      <OverlayPanel
        ref={op}
        showCloseIcon
        dismissable
        style={{ width: 350, minWidth: "280px" }}
      >
        <div className="overlay-actions">
          <BulkSelect
            value={bulkNumber}
            onChange={setBulkNumber}
            onSubmit={onBulkSelect}
            loading={bulkLoading}
          />
          <Button
            label="Clear All"
            severity="danger"
            outlined
            onClick={onClearAll}
            disabled={selectedIds.size === 0}
            className="clear-btn"
          />
        </div>
      </OverlayPanel>

      <style>
        {`
          .title-header {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .overlay-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 8px;
          }

          .clear-btn {
            width: 100%;
          }

          /* Responsive fixes */
          @media (max-width: 768px) {
            .p-datatable {
              font-size: 13px;
            }
            .p-datatable-wrapper {
              overflow-x: auto;
            }
            .title-header {
              flex-direction: row;
              justify-content: space-between;
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .p-datatable {
              font-size: 12px;
            }
            .overlay-actions {
              gap: 8px;
            }
          }
        `}
      </style>
    </div>
  );

  return (
    <DataTable
      value={data}
      dataKey="id"
      selection={currentSelection}
      onSelectionChange={(e: { value: Artwork[] }) => onSelectionChange(e.value)}
      loading={loading}
      selectionMode="multiple"
      scrollable
      scrollHeight="400px"
      className="p-datatable-sm"
    >
      <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
      <Column field="title" header={titleHeader} />
      <Column field="place_of_origin" header="Place of Origin" />
      <Column field="artist_display" header="Artist Display" />
      <Column field="inscriptions" header="Inscriptions" />
      <Column field="date_start" header="Date Start" />
      <Column field="date_end" header="Date End" />
    </DataTable>
  );
}
