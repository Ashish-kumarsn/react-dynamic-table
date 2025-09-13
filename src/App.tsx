// src/App.tsx
import React, { useEffect, useState } from "react";
import type { Artwork } from "./types";
import { fetchPage } from "./Api";
import ArtworkTable from "./components/ArtWorkTable";
import BulkSelect from "./components/BulkSelect";
import { Button } from "primereact/button";

const App: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkNumber, setBulkNumber] = useState<number>(0);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

  // fetch page each time page changes (no caching full page)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPage(page)
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
        setTotalPages(res.pagination.total_pages ?? 1);
      })
      .catch((err) => console.error(err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page]);

  // When selection on current page changes, update global selectedIds (Set)
  const handleSelectionChange = (selectedRows: Artwork[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const currentPageIds = data.map((d) => d.id);
      const selectedOnPage = new Set(selectedRows.map((r) => r.id));

      selectedOnPage.forEach((id) => next.add(id));
      currentPageIds.forEach((id) => {
        if (!selectedOnPage.has(id)) next.delete(id);
      });
      return next;
    });
  };

  // Bulk select N rows starting from current page (sequentially fetch pages).
  const handleBulkSelect = async () => {
    if (bulkNumber <= 0) return;
    setBulkLoading(true);
    try {
      let need = bulkNumber;
      let p = page;
      const nextSet = new Set(selectedIds);

      const firstPageInfo = await fetchPage(p);
      let maxPages = firstPageInfo.pagination.total_pages ?? totalPages;

      for (const row of firstPageInfo.data) {
        if (need <= 0) break;
        if (!nextSet.has(row.id)) {
          nextSet.add(row.id);
          need--;
        }
      }
      p++;

      while (need > 0 && p <= maxPages) {
        const res = await fetchPage(p);
        for (const row of res.data) {
          if (need <= 0) break;
          if (!nextSet.has(row.id)) {
            nextSet.add(row.id);
            need--;
          }
        }
        p++;
      }

      setSelectedIds(nextSet);
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

      {/* Table */}
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

      {/* Footer Controls */}
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

        {/* Bulk Select */}
        <BulkSelect
          value={bulkNumber}
          onChange={setBulkNumber}
          onSubmit={handleBulkSelect}
          loading={bulkLoading}
        />

        {/* Clear All */}
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
            borderRadius: "12px",
            background: "black",
            color: "white",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Selected: {selectedIds.size}
        </div>
      </div>

      {/* Responsive styling */}
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
