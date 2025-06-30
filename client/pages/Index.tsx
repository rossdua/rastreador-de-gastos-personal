import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Expense, PaginatedExpensesResponse } from "@shared/api";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

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
      // Simulamos datos con paginación para testing ya que no hay backend
      const allExpenses = [
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
        {
          id: 3,
          amount: 120.0,
          description: "Compras del supermercado",
          dateRecorded: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          amount: 75.0,
          description: "Gasolina",
          dateRecorded: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 5,
          amount: 35.0,
          description: "Café",
          dateRecorded: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 6,
          amount: 200.0,
          description: "Cena en restaurante",
          dateRecorded: new Date(Date.now() - 345600000).toISOString(),
        },
        {
          id: 7,
          amount: 150.0,
          description: "Compras en línea",
          dateRecorded: new Date(Date.now() - 432000000).toISOString(),
        },
        {
          id: 8,
          amount: 60.0,
          description: "Taxi",
          dateRecorded: new Date(Date.now() - 518400000).toISOString(),
        },
        {
          id: 9,
          amount: 90.0,
          description: "Farmacia",
          dateRecorded: new Date(Date.now() - 604800000).toISOString(),
        },
        {
          id: 10,
          amount: 180.0,
          description: "Supermercado",
          dateRecorded: new Date(Date.now() - 691200000).toISOString(),
        },
        {
          id: 11,
          amount: 40.0,
          description: "Desayuno",
          dateRecorded: new Date(Date.now() - 777600000).toISOString(),
        },
        {
          id: 12,
          amount: 250.0,
          description: "Reparación auto",
          dateRecorded: new Date(Date.now() - 864000000).toISOString(),
        },
      ];

      // Simulamos paginación
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedExpenses = allExpenses.slice(startIndex, endIndex);

      setExpenses(paginatedExpenses);
      setTotalItemsGlobal(allExpenses.length);
      setLastPage(Math.ceil(allExpenses.length / itemsPerPage));
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

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(amount), description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAmount("");
      setDescription("");
      // Volver a la primera página después de agregar un nuevo gasto
      setCurrentPage(1);
      fetchExpenses();
    } catch (error) {
      console.error("Error al añadir gasto:", error);
      // Fallback: agregar localmente si no hay backend
      const newExpense: Expense = {
        id: Date.now(),
        amount: Number(amount),
        description,
        dateRecorded: new Date().toISOString(),
      };

      setExpenses((prev) => {
        const newList = [newExpense, ...prev];
        // Mantener solo los elementos de la página actual
        return newList.slice(0, itemsPerPage);
      });
      setTotalItemsGlobal((prev) => prev + 1);
      setLastPage(Math.ceil((totalItemsGlobal + 1) / itemsPerPage));
      setAmount("");
      setDescription("");
      setCurrentPage(1); // Ir a la primera página para ver el nuevo gasto
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary">
      {/* Header con toggle de tema */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-expense-500 to-expense-600 rounded-xl shadow-sm">
                <svg
                  className="h-6 w-6 text-white"
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-expense-600 to-expense-700 bg-clip-text text-transparent">
                Rastreador de Gastos
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header principal */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-expense-500 to-expense-600 rounded-2xl shadow-lg">
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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-expense-600 to-expense-700 bg-clip-text text-transparent">
              Tu Panel de Control
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Gestiona tus gastos de manera inteligente y eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario para añadir gastos */}
          <div className="lg:col-span-1">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-expense-500 to-expense-600 text-white p-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
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
                </h3>
                <p className="text-expense-100 text-sm mt-1">
                  Añade un nuevo gasto a tu registro
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <svg
                        className="h-4 w-4 text-expense-500"
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
                      className="w-full px-3 py-2 text-lg font-mono bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Descripción
                    </label>
                    <input
                      type="text"
                      placeholder="Descripción del gasto..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-expense-500 to-expense-600 hover:from-expense-600 hover:to-expense-700 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
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
              <div className="bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-expense-100 dark:bg-expense-900 rounded-lg">
                    <svg
                      className="h-5 w-5 text-expense-600"
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
                    <p className="text-sm text-muted-foreground">
                      Total Página Actual
                    </p>
                    {isLoading ? (
                      <div className="h-6 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold text-expense-700">
                        ${totalExpensesOnCurrentPage.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <svg
                      className="h-5 w-5 text-success"
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
                    <p className="text-sm text-muted-foreground">
                      Total Registros
                    </p>
                    {isLoading ? (
                      <div className="h-6 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold text-success">
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
            <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">
                      Mis Gastos
                    </h3>
                    <p className="text-muted-foreground">
                      Página {currentPage} de {lastPage}
                    </p>
                  </div>

                  {/* Buscador */}
                  <div className="relative max-w-sm">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
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
                      className="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                        className="flex items-center gap-4 p-4 border border-border rounded-lg"
                      >
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredExpenses.length === 0 && searchTerm ? (
                      <div className="text-center py-12">
                        <svg
                          className="h-12 w-12 text-muted-foreground mx-auto mb-4"
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
                        <p className="text-muted-foreground">
                          No se encontraron gastos que coincidan con su
                          búsqueda.
                        </p>
                      </div>
                    ) : totalItemsGlobal === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="h-12 w-12 text-muted-foreground mx-auto mb-4"
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
                        <p className="text-muted-foreground">
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
                            className="group flex items-center gap-4 p-4 border border-border rounded-xl hover:shadow-md transition-all duration-200 hover:border-expense-200 bg-gradient-to-r from-card to-expense-50/30 dark:to-expense-950/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-expense-500 to-expense-600 rounded-full shadow-sm">
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
                              <p className="font-medium text-foreground truncate">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <svg
                                  className="h-3 w-3 text-muted-foreground"
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
                                <p className="text-sm text-muted-foreground">
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
                              <span className="bg-secondary text-secondary-foreground text-base font-bold px-3 py-1 rounded-md">
                                $
                                {typeof expense.amount === "number"
                                  ? expense.amount.toFixed(2)
                                  : "N/A"}
                              </span>

                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-lg"
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

                {/* Controles de Paginación */}
                {lastPage > 1 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            totalItemsGlobal,
                          )}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium">{totalItemsGlobal}</span>{" "}
                        gastos
                      </p>

                      <div className="flex items-center gap-2">
                        {/* Botón Anterior */}
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          Anterior
                        </button>

                        {/* Números de página */}
                        <div className="flex gap-1">
                          {Array.from(
                            { length: lastPage },
                            (_, i) => i + 1,
                          ).map((pageNum) => {
                            // Mostrar solo algunas páginas alrededor de la actual
                            if (
                              pageNum === 1 ||
                              pageNum === lastPage ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  disabled={isLoading}
                                  className={`h-9 w-9 text-sm rounded-lg transition-colors ${
                                    currentPage === pageNum
                                      ? "bg-expense-500 text-white shadow-sm"
                                      : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="h-9 w-9 flex items-center justify-center text-sm text-muted-foreground"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        {/* Botón Siguiente */}
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === lastPage || isLoading}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Siguiente
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
