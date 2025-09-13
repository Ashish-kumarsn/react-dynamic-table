// src/App.tsx
import React, { useEffect, useState } from "react";
import type { Artwork } from "./types";
import { fetchPage } from "./Api";
import ArtworkTable from "./components/ArtWorkTable";
import BulkSelect from "./components/BulkSelect";
import { Button } from "primereact/button";

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkNumber, setBulkNumber] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data whenever page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPage(page)
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
        setTotalPages(res.pagination.total_pages ?? 1);
      })
      .catch(console.error)
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [page]);

  // Update global selectedIds when selection changes on current page
  const handleSelectionChange = (selectedRows: Artwork[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = data.map((d) => d.id);
      const selectedOnPage = new Set(selectedRows.map((r) => r.id));

      // Add newly selected IDs
      selectedOnPage.forEach((id) => next.add(id));
      // Remove unselected IDs from current page
      pageIds.forEach((id) => {
        if (!selectedOnPage.has(id)) next.delete(id);
      });

      return next;
    });
  };

  // Bulk select N rows starting from current page
  const handleBulkSelect = async () => {
    if (bulkNumber <= 0) return;

    setBulkLoading(true);
    try {
      let remaining = bulkNumber;
      let currentPage = page;
      const newSelected = new Set(selectedIds);

      const firstPage = await fetchPage(currentPage);
      const maxPages = firstPage.pagination.total_pages ?? totalPages;

      // Select rows from current page
      for (const row of firstPage.data) {
        if (remaining <= 0) break;
        if (!newSelected.has(row.id)) {
          newSelected.add(row.id);
          remaining--;
        }
      }
      currentPage++;

      // Continue selecting from subsequent pages if needed
      while (remaining > 0 && currentPage <= maxPages) {
        const res = await fetchPage(currentPage);
        for (const row of res.data) {
          if (remaining <= 0) break;
          if (!newSelected.has(row.id)) {
            newSelected.add(row.id);
            remaining--;
          }
        }
        currentPage++;
      }

      setSelectedIds(newSelected);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  // Clear all selected rows
  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Artworks (PrimeReact DataTable)</h2>

      {/* Artwork table with multi-selection and bulk actions */}
      <ArtworkTable
        data={data}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        bulkNumber={bulkNumber}
        setBulkNumber={setBulkNumber}
        onBulkSelect={handleBulkSelect}
        bulkLoading={bulkLoading}
        onClearAll={handleClearAll}
      />

      {/* Footer controls */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Pagination */}
        <Button
          label="Prev"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        />
        <div style={{ minWidth: 80, textAlign: "center" }}>
          Page {page} / {totalPages}
        </div>
        <Button
          label="Next"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages || loading}
        />

        {/* Bulk select */}
        <BulkSelect
          value={bulkNumber}
          onChange={setBulkNumber}
          onSubmit={handleBulkSelect}
          loading={bulkLoading}
        />

        {/* Clear all selection */}
        <Button
          label="Clear All"
          severity="danger"
          onClick={handleClearAll}
          disabled={selectedIds.size === 0}
        />

        {/* Selected count badge */}
        <div
          style={{
            marginLeft: "auto",
            padding: "4px 12px",
            borderRadius: 12,
            background: "black",
            color: "white",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Selected: {selectedIds.size}
        </div>
      </div>

      {/* Responsive adjustments */}
      <style>
        {`
          @media (max-width: 768px) {
            .p-button {
              font-size: 12px !important;
              padding: 4px 8px !important;
            }
            h2 {
              font-size: 18px;
            }
          }

          @media (max-width: 480px) {
            div[style*="margin-top: 16px"] {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            div[style*="margin-top: 16px"] > * {
              width: 100% !important;
              justify-content: center !important;
            }
            div[style*="margin-top: 16px"] > div[style*="background: black"] {
              text-align: center;
              margin-left: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;
