import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Truck, Fuel, MapPin, ReceiptText, Save, Trash2, Download } from "lucide-react";

export default function AppFretesMotorista() {
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    motorista: "",
    cliente: "",
    origem: "",
    destino: "",
    carga: "",
    peso: "",
    valorFrete: "",
    kmIda: "",
    kmVolta: "",
    litrosDiesel: "",
    valorDiesel: "",
    pedagio: "",
    descarga: "",
    estacionamento: "",
    adiantamento: "",
    outrosCustos: "",
    observacoes: "",
    status: "Em andamento",
  });

  const [fretes, setFretes] = useState([]);

  const moeda = (valor) => {
    const numero = Number(valor || 0);
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const numero = (valor) => Number(String(valor).replace(",", ".")) || 0;

  const calculo = useMemo(() => {
    const kmTotal = numero(form.kmIda) + numero(form.kmVolta);
    const custoDiesel = numero(form.litrosDiesel) * numero(form.valorDiesel);
    const custos = custoDiesel + numero(form.pedagio) + numero(form.descarga) + numero(form.estacionamento) + numero(form.outrosCustos);
    const valorFrete = numero(form.valorFrete);
    const saldoMotorista = numero(form.adiantamento) - custos;
    const resultadoBruto = valorFrete - custos;
    const custoKm = kmTotal > 0 ? custos / kmTotal : 0;
    const freteKm = kmTotal > 0 ? valorFrete / kmTotal : 0;

    return { kmTotal, custoDiesel, custos, saldoMotorista, resultadoBruto, custoKm, freteKm };
  }, [form]);

  const atualizar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const salvarFrete = () => {
    if (!form.motorista || !form.origem || !form.destino || !form.valorFrete) {
      alert("Preencha pelo menos: motorista, origem, destino e valor do frete.");
      return;
    }

    const novoFrete = {
      id: Date.now(),
      ...form,
      calculo,
    };

    setFretes((prev) => [novoFrete, ...prev]);
    setForm({
      data: new Date().toISOString().slice(0, 10),
      motorista: form.motorista,
      cliente: "",
      origem: "",
      destino: "",
      carga: "",
      peso: "",
      valorFrete: "",
      kmIda: "",
      kmVolta: "",
      litrosDiesel: "",
      valorDiesel: form.valorDiesel,
      pedagio: "",
      descarga: "",
      estacionamento: "",
      adiantamento: "",
      outrosCustos: "",
      observacoes: "",
      status: "Em andamento",
    });
  };

  const excluirFrete = (id) => setFretes((prev) => prev.filter((frete) => frete.id !== id));

  const exportarCSV = () => {
    if (fretes.length === 0) {
      alert("Nenhum frete salvo para exportar.");
      return;
    }

    const cabecalho = [
      "Data", "Motorista", "Cliente", "Origem", "Destino", "Carga", "Peso", "Valor Frete", "Km Total", "Litros Diesel", "Valor Diesel", "Custo Diesel", "Pedagio", "Descarga", "Estacionamento", "Outros Custos", "Custos Totais", "Resultado Bruto", "Adiantamento", "Saldo Motorista", "Status", "Observacoes"
    ];

    const linhas = fretes.map((f) => [
      f.data, f.motorista, f.cliente, f.origem, f.destino, f.carga, f.peso,
      f.valorFrete, f.calculo.kmTotal, f.litrosDiesel, f.valorDiesel, f.calculo.custoDiesel,
      f.pedagio, f.descarga, f.estacionamento, f.outrosCustos, f.calculo.custos,
      f.calculo.resultadoBruto, f.adiantamento, f.calculo.saldoMotorista, f.status, f.observacoes
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((campo) => `"${String(campo ?? "").replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fretes_motorista.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const Campo = ({ label, campo, type = "text", placeholder = "" }) => (
    <div className="space-y-1">
      <Label className="text-sm text-slate-700">{label}</Label>
      <Input
        type={type}
        value={form[campo]}
        onChange={(e) => atualizar(campo, e.target.value)}
        placeholder={placeholder}
        className="rounded-xl"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Truck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Controle de Fretes</h1>
              <p className="text-sm text-slate-300">Preenchimento rápido para motorista</p>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <MapPin size={20} />
              <h2 className="text-lg font-semibold">Dados do frete</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Campo label="Data" campo="data" type="date" />
              <Campo label="Motorista" campo="motorista" placeholder="Nome do motorista" />
              <Campo label="Cliente/Empresa" campo="cliente" placeholder="Ex: Cooxupé" />
              <Campo label="Origem" campo="origem" placeholder="Cidade de carregamento" />
              <Campo label="Destino" campo="destino" placeholder="Cidade de entrega" />
              <Campo label="Carga" campo="carga" placeholder="Ex: café, milho, adubo" />
              <Campo label="Peso/Toneladas" campo="peso" placeholder="Ex: 32" />
              <Campo label="Valor do frete recebido" campo="valorFrete" type="number" placeholder="R$" />
              <div className="space-y-1">
                <Label className="text-sm text-slate-700">Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => atualizar("status", e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option>Em andamento</option>
                  <option>Carregado</option>
                  <option>Entregue</option>
                  <option>Recebido</option>
                  <option>Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Fuel size={20} />
              <h2 className="text-lg font-semibold">Custos da viagem</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Campo label="Km ida" campo="kmIda" type="number" />
              <Campo label="Km volta" campo="kmVolta" type="number" />
              <Campo label="Litros de diesel" campo="litrosDiesel" type="number" />
              <Campo label="Valor diesel/litro" campo="valorDiesel" type="number" />
              <Campo label="Pedágio" campo="pedagio" type="number" />
              <Campo label="Descarga" campo="descarga" type="number" />
              <Campo label="Estacionamento" campo="estacionamento" type="number" />
              <Campo label="Outros custos" campo="outrosCustos" type="number" />
              <Campo label="Adiantamento ao motorista" campo="adiantamento" type="number" />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-slate-700">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => atualizar("observacoes", e.target.value)}
                placeholder="Ex: número do CT-e, nota fiscal, problema na descarga, comprovantes enviados..."
                className="min-h-24 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Km total</p>
              <p className="text-xl font-bold">{calculo.kmTotal.toFixed(0)} km</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Custo diesel</p>
              <p className="text-xl font-bold">{moeda(calculo.custoDiesel)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Custo total</p>
              <p className="text-xl font-bold">{moeda(calculo.custos)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Resultado bruto</p>
              <p className={`text-xl font-bold ${calculo.resultadoBruto >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {moeda(calculo.resultadoBruto)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Button onClick={salvarFrete} className="h-12 rounded-2xl text-base">
            <Save className="mr-2" size={18} /> Salvar frete
          </Button>
          <Button onClick={exportarCSV} variant="outline" className="h-12 rounded-2xl text-base">
            <Download className="mr-2" size={18} /> Exportar planilha CSV
          </Button>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-3 text-sm">
              <p><strong>Frete/km:</strong> {moeda(calculo.freteKm)}</p>
              <p><strong>Custo/km:</strong> {moeda(calculo.custoKm)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <ReceiptText size={20} />
              <h2 className="text-lg font-semibold">Fretes salvos</h2>
            </div>

            {fretes.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum frete salvo ainda.</p>
            ) : (
              <div className="space-y-3">
                {fretes.map((frete) => (
                  <div key={frete.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{frete.origem} → {frete.destino}</p>
                        <p className="text-sm text-slate-500">{frete.data} • {frete.motorista} • {frete.status}</p>
                        <p className="mt-2 text-sm">Cliente: <strong>{frete.cliente || "-"}</strong> | Carga: <strong>{frete.carga || "-"}</strong></p>
                        <p className="text-sm">Frete: <strong>{moeda(frete.valorFrete)}</strong> | Custo: <strong>{moeda(frete.calculo.custos)}</strong> | Resultado: <strong>{moeda(frete.calculo.resultadoBruto)}</strong></p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => excluirFrete(frete.id)} className="rounded-xl">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
      }
