import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const Calculator = () => {
  const [data, setData] = useState({
    // Основные параметры
    quantity: 100,
    format: 'A1',
    sharesPerSheet: 1,
    setupSheets: 200,
    sheetArea: 0.5,
    paperWeight: 0.3,
    paperPrice: 14200,
    profitMargin: 30,

    // Опции и их стороны
    options: {
      printing: { enabled: true, doubleSided: false },
      lamination: { enabled: false, doubleSided: false },
      uvCoating: { enabled: false, doubleSided: false },
      embossing: { enabled: false, doubleSided: false },
      dieCutting: { enabled: false, doubleSided: false },
      congreve: { enabled: false, doubleSided: false },
      foil: { enabled: false }
    }
  });

  const [results, setResults] = useState({
    sheets: 0,
    totalArea: 0,
    paperWeight: 0,
    costs: {
      paper: 0,
      printing: 0,
      forms: 0,
      additional: 0,
      total: 0
    },
    prices: {
      withoutVAT: 0,
      withVAT: 0,
      perUnit: 0
    }
  });

  const prices = {
    formats: {
      A1: { printSetup: 900000, printPerUnit: 220, forms: 280000 },
      A2: { printSetup: 400000, printPerUnit: 120, forms: 160000 },
      A3: { printSetup: 200000, printPerUnit: 80, forms: 100000 }
    },
    operations: {
      dieCutting: {
        A1: { perUnit: 150 },
        A2: { perUnit: 100 },
        A3: { base: 100000, perUnit: 70 }
      },
      congreve: {
        A1: { base: 350000, perUnit: 350 },
        A2: { base: 280000, perUnit: 150 },
        A3: { base: 200000, perUnit: 90 }
      }
    }
  };

  useEffect(() => {
    // Расчет базовых параметров
    const totalSheets = Math.ceil(data.quantity / data.sharesPerSheet) + data.setupSheets;
    const totalArea = totalSheets * data.sheetArea;
    const paperWeight = totalArea * data.paperWeight;
    const paperCost = paperWeight * data.paperPrice;

    // Расчет стоимости печати и форм
    const format = prices.formats[data.format];
    const printMultiplier = data.options.printing.doubleSided ? 2 : 1;
    const printingCost = (format.printSetup + 
      (data.quantity > 1000 ? (data.quantity - 1000) * format.printPerUnit : 0)) * printMultiplier;
    const formsCost = format.forms * printMultiplier;

    // Расчет дополнительных операций
    let additionalCost = 0;

    if (data.options.lamination.enabled) {
      additionalCost += totalArea * 1500 * (data.options.lamination.doubleSided ? 2 : 1);
    }

    if (data.options.uvCoating.enabled) {
      additionalCost += totalArea * 1100 * (data.options.uvCoating.doubleSided ? 2 : 1);
    }

    if (data.options.dieCutting.enabled) {
      const dieCutting = prices.operations.dieCutting[data.format];
      const cost = (dieCutting.base || 0) + (totalSheets * dieCutting.perUnit);
      additionalCost += cost * (data.options.dieCutting.doubleSided ? 2 : 1);
    }

    if (data.options.congreve.enabled) {
      const congreve = prices.operations.congreve[data.format];
      const cost = congreve.base + (data.quantity > 1000 ? (data.quantity - 1000) * congreve.perUnit : 0);
      additionalCost += cost * (data.options.congreve.doubleSided ? 2 : 1);
    }

    if (data.options.foil.enabled) {
      additionalCost += 150000;
    }

    // Итоговые расчеты
    const totalCost = paperCost + printingCost + formsCost + additionalCost;
    const vatDeduction = totalCost * 0.115;
    const priceWithoutVAT = totalCost / (1 - (data.profitMargin / 100));
    const priceWithVAT = (priceWithoutVAT * 1.12) - vatDeduction;

    setResults({
      sheets: totalSheets,
      totalArea,
      paperWeight,
      costs: {
        paper: paperCost,
        printing: printingCost,
        forms: formsCost,
        additional: additionalCost,
        total: totalCost
      },
      prices: {
        withoutVAT: priceWithoutVAT,
        withVAT: priceWithVAT,
        perUnit: priceWithVAT / data.quantity
      }
    });
  }, [data]);

  const updateOption = (option, field, value) => {
    setData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: {
          ...prev.options[option],
          [field]: value
        }
      }
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Калькулятор</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Основные параметры */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Тираж</label>
              <input
                type="number"
                value={data.quantity}
                onChange={(e) => setData(prev => ({...prev, quantity: parseInt(e.target.value) || 0}))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Формат</label>
              <select
                value={data.format}
                onChange={(e) => setData(prev => ({...prev, format: e.target.value}))}
                className="w-full p-2 border rounded"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Доли на листе</label>
              <input
                type="number"
                value={data.sharesPerSheet}
                onChange={(e) => setData(prev => ({...prev, sharesPerSheet: parseInt(e.target.value) || 1}))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Листы на приладку</label>
              <input
                type="number"
                value={data.setupSheets}
                onChange={(e) => setData(prev => ({...prev, setupSheets: parseInt(e.target.value) || 0}))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Площадь листа (м²)</label>
              <input
                type="number"
                value={data.sheetArea}
                onChange={(e) => setData(prev => ({...prev, sheetArea: parseFloat(e.target.value) || 0}))}
                step="0.001"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Граммаж (г/м²)</label>
              <input
                type="number"
                value={data.paperWeight}
                onChange={(e) => setData(prev => ({...prev, paperWeight: parseFloat(e.target.value) || 0}))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Цена за кг</label>
              <input
                type="number"
                value={data.paperPrice}
                onChange={(e) => setData(prev => ({...prev, paperPrice: parseFloat(e.target.value) || 0}))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Опции */}
          <div className="space-y-4">
            <h3 className="font-medium">Операции:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.options).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value.enabled}
                      onChange={(e) => updateOption(key, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                  {value.enabled && key !== 'foil' && (
                    <label className="flex items-center space-x-2 pl-6">
                      <input
                        type="checkbox"
                        checked={value.doubleSided}
                        onChange={(e) => updateOption(key, 'doubleSided', e.target.checked)}
                        className="rounded"
                      />
                      <span>Двусторонняя</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Результаты */}
          <div className="mt-6 p-4 bg-gray-50 rounded space-y-2">
            <h3 className="font-medium">Результаты расчета:</h3>
            <div className="grid grid-cols-2 gap-2">
              <span>Количество листов:</span>
              <span className="text-right">{results.sheets}</span>
              
              <span>Общая площадь (м²):</span>
              <span className="text-right">{results.totalArea.toFixed(2)}</span>
              
              <span>Вес бумаги (кг):</span>
              <span className="text-right">{results.paperWeight.toFixed(2)}</span>
              
              <span>Стоимость бумаги:</span>
              <span className="text-right">{results.costs.paper.toFixed(2)}</span>
              
              <span>Стоимость печати:</span>
              <span className="text-right">{results.costs.printing.toFixed(2)}</span>
              
              <span>Стоимость форм:</span>
              <span className="text-right">{results.costs.forms.toFixed(2)}</span>
              
              <span>Доп. операции:</span>
              <span className="text-right">{results.costs.additional.toFixed(2)}</span>
              
              <span className="font-medium">Общая себестоимость:</span>
              <span className="text-right font-medium">{results.costs.total.toFixed(2)}</span>
              
              <span>Цена без НДС:</span>
              <span className="text-right">{results.prices.withoutVAT.toFixed(2)}</span>
              
              <span>Цена с НДС:</span>
              <span className="text-right">{results.prices.withVAT.toFixed(2)}</span>
              
              <span className="font-medium">Цена за единицу:</span>
              <span className="text-right font-medium">{results.prices.perUnit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator; 