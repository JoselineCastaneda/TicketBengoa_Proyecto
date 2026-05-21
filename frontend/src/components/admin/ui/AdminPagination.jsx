const AdminPagination = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  itemLabel = "registros",
  onPrevious,
  onNext,
}) => {
  return (
    <div className="usuarios-pagination">
      <span>
        Mostrando {totalItems === 0 ? 0 : startIndex + 1} a{" "}
        {Math.min(endIndex, totalItems)} de {totalItems} {itemLabel} · Página{" "}
        {currentPage} de {totalPages || 1}
      </span>

      <div className="usuarios-pagination-actions">
        <button type="button" disabled={currentPage === 1} onClick={onPrevious}>
          Anterior
        </button>

        <strong>
          {currentPage} / {totalPages || 1}
        </strong>

        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={onNext}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;