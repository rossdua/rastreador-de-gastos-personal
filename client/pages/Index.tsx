import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Expense, PaginatedExpensesResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Plus,
  Search,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index() {
  // Estados para los datos de los gastos y el formulario
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para la paginación y el estado de carga
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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

      // Ordena los gastos por fecha (más recientes primero)
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
      alert(
        "Error al cargar los gastos. Revisa la consola del navegador y el backend.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Efecto para cargar los gastos la primera vez y cada vez que cambian los parámetros de paginación
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

  // Calcula el total de los gastos que están actualmente visibles (filtrados) en la página
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
      fetchExpenses();
    } catch (error) {
      console.error("Error al añadir gasto:", error);
      alert(
        "Error al añadir el gasto. Revisa la consola del navegador y el backend.",
      );
    }
  };

  // Manejador para eliminar un gasto
  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (filteredExpenses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      alert(
        "Error al eliminar el gasto. Revisa la consola del navegador y el backend.",
      );
    }
  };

  // Renderiza los botones numéricos de paginación
  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= lastPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          disabled={isLoading}
          className={cn(
            "h-9 w-9 p-0",
            currentPage === i && "bg-expense-500 hover:bg-expense-600",
          )}
        >
          {i}
        </Button>,
      );
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-expense-50 via-background to-expense-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-expense-500 to-expense-600 rounded-2xl shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-expense-600 to-expense-700 bg-clip-text text-transparent">
              Rastreador de Gastos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gestiona tus gastos de manera inteligente y eficiente
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario para añadir gastos */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-expense-500 to-expense-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nuevo Gasto
                </CardTitle>
                <CardDescription className="text-expense-100">
                  Añade un nuevo gasto a tu registro
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-expense-500" />
                      Monto
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      required
                      className="text-lg font-mono border-expense-200 focus:border-expense-500 focus:ring-expense-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <Input
                      type="text"
                      placeholder="Descripción del gasto..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      maxLength={50}
                      className="border-expense-200 focus:border-expense-500 focus:ring-expense-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-expense-500 to-expense-600 hover:from-expense-600 hover:to-expense-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Gasto
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-expense-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-expense-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Total Página Actual
                      </p>
                      {isLoading ? (
                        <div className="h-6 bg-expense-100 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-xl font-bold text-expense-700">
                          ${totalExpensesOnCurrentPage.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Database className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Total Registros
                      </p>
                      {isLoading ? (
                        <div className="h-6 bg-expense-100 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-xl font-bold text-success">
                          {totalItemsGlobal}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lista de gastos */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Mis Gastos</CardTitle>
                    <CardDescription>
                      Página {currentPage} de {lastPage}
                    </CardDescription>
                  </div>

                  {/* Buscador */}
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 border-expense-200 focus:border-expense-500 focus:ring-expense-500"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="h-10 w-10 bg-expense-100 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-expense-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-expense-50 rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="h-6 w-20 bg-expense-100 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredExpenses.length === 0 && searchTerm ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No se encontraron gastos que coincidan con su búsqueda
                          en esta página.
                        </p>
                      </div>
                    ) : totalItemsGlobal === 0 ? (
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                            className="group flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-expense-200 bg-gradient-to-r from-white to-expense-50/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-expense-500 to-expense-600 rounded-full shadow-sm">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {expense.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
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
                              <Badge
                                variant="secondary"
                                className="text-base font-bold px-3 py-1"
                              >
                                $
                                {typeof expense.amount === "number"
                                  ? expense.amount.toFixed(2)
                                  : "N/A"}
                              </Badge>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Paginación */}
                {lastPage > 1 && (
                  <>
                    <Separator className="my-6" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {filteredExpenses.length} de{" "}
                        {totalItemsGlobal} gastos
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                          className="border-expense-200 hover:bg-expense-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>

                        <div className="flex gap-1">
                          {renderPaginationButtons()}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === lastPage || isLoading}
                          className="border-expense-200 hover:bg-expense-50"
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
