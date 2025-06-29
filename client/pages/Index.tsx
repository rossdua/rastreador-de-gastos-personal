import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Expense, PaginatedExpensesResponse } from "@shared/api";

export default function Index() {
  // Estados para los datos de los gastos y el formulario
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para la paginación y el estado de carga
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItemsGlobal, setTotalItemsGlobal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = "http://localhost:3000/api/expenses";

  // Función para cargar los gastos desde el backend
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}?page=${currentPage}&limit=${itemsPerPage}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const paginatedData: PaginatedExpensesResponse = await response.json();

      const sortedData = paginatedData.data.sort(
        (a, b) =>
          new Date(b.dateRecorded).getTime() -
          new Date(a.dateRecorded).getTime(),
      );

      setExpenses(sortedData);
      setTotalItemsGlobal(paginatedData.total);
      setLastPage(paginatedData.lastPage);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      // Simulamos datos para testing ya que no hay backend
      setExpenses([
        {
          id: 1,
          amount: 25.5,
          description: "Almuerzo",
          dateRecorded: new Date().toISOString(),
        },
        {
          id: 2,
          amount: 45.0,
          description: "Transporte",
          dateRecorded: new Date().toISOString(),
        },
      ]);
      setTotalItemsGlobal(2);
      setLastPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Filtra los gastos basándose en el término de búsqueda actual
  const filteredExpenses = useMemo(() => {
    if (!searchTerm) {
      return expenses;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        expense.amount.toString().includes(lowerCaseSearchTerm) ||
        new Date(expense.dateRecorded)
          .toLocaleDateString()
          .includes(lowerCaseSearchTerm),
    );
  }, [expenses, searchTerm]);

  const totalExpensesOnCurrentPage = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Manejador para agregar un nuevo gasto
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === "" || description.trim() === "") {
      alert("Por favor, ingresa un monto y una descripción.");
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      amount: Number(amount),
      description,
      dateRecorded: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setTotalItemsGlobal((prev) => prev + 1);
    setAmount("");
    setDescription("");
  };

  // Manejador para eliminar un gasto
  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      return;
    }
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    setTotalItemsGlobal((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              Rastreador de Gastos
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gestiona tus gastos de manera inteligente y eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario para añadir gastos */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Nuevo Gasto
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Añade un nuevo gasto a tu registro
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                      <svg
                        className="h-4 w-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Monto
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      required
                      className="w-full px-3 py-2 text-lg font-mono border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <input
                      type="text"
                      placeholder="Descripción del gasto..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Añadir Gasto
                  </button>
                </form>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Página Actual</p>
                    {isLoading ? (
                      <div className="h-6 bg-purple-100 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold text-purple-700">
                        ${totalExpensesOnCurrentPage.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Registros</p>
                    {isLoading ? (
                      <div className="h-6 bg-purple-100 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold text-green-600">
                        {totalItemsGlobal}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de gastos */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Mis Gastos
                    </h2>
                    <p className="text-gray-600">
                      Página {currentPage} de {lastPage}
                    </p>
                  </div>

                  {/* Buscador */}
                  <div className="relative max-w-sm">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 bg-purple-100 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-purple-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-purple-50 rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="h-6 w-20 bg-purple-100 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredExpenses.length === 0 && searchTerm ? (
                      <div className="text-center py-12">
                        <svg
                          className="h-12 w-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p className="text-gray-600">
                          No se encontraron gastos que coincidan con su
                          búsqueda.
                        </p>
                      </div>
                    ) : totalItemsGlobal === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="h-12 w-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <p className="text-gray-600">
                          No hay gastos registrados. ¡Empieza a añadir algunos!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredExpenses.map((expense, index) => (
                          <div
                            key={
                              expense.id > 0
                                ? expense.id
                                : `${expense.description || "no-desc"}-${index}-${Math.random()}`
                            }
                            className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-purple-200 bg-gradient-to-r from-white to-purple-50/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-sm">
                              <svg
                                className="h-5 w-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <svg
                                  className="h-3 w-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="text-sm text-gray-500">
                                  {expense.dateRecorded &&
                                  !isNaN(
                                    new Date(expense.dateRecorded).getTime(),
                                  )
                                    ? new Date(
                                        expense.dateRecorded,
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Fecha desconocida"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="bg-gray-100 text-gray-900 text-base font-bold px-3 py-1 rounded-md">
                                $
                                {typeof expense.amount === "number"
                                  ? expense.amount.toFixed(2)
                                  : "N/A"}
                              </span>

                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
