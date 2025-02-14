import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const initialComponentData = {
  name: '',
  quantity: 100,
  format: 'A1',
  sharesPerSheet: 1,
  setupSheets: 200,
  sheetArea: 0.5,
  paperWeight: 0.3,
  paperPrice: 14200,
  priceType: 'kg',
  profitMargin: 30,
  pagesPerProduct: 1,
  printedSheets: 1,
  options: {
    printing: { enabled: true, doubleSided: false, doubleForms: false },
    digitalPrinting: { enabled: false, doubleSided: false, largeFormat: false },
    lamination: { enabled: false, doubleSided: false },
    uvCoating: { enabled: false, doubleSided: false },
    embossing: { enabled: false, doubleSided: false },
    dieCutting: { enabled: false, doubleSided: false },
    congreve: { enabled: false, doubleSided: false },
    foil: { enabled: false },
    binding: { enabled: false, ringsCount: 1 },
    stapling: { enabled: false },
    thermalBinding: { enabled: false },
    threadSewing: { enabled: false, signatures: 1 },
    folding: { enabled: false, folds: 1 },
    mounting: { enabled: false },
    threeDLacquer: { enabled: false },
    threeDFoil: { enabled: false },
    spotLacquer: { enabled: false, base: 0, perUnit: 0, threshold: 0 },
    uvPrinting: { enabled: false, whiteColor: false },
    plotter: { enabled: false },
    foldGluing: { enabled: false },
    manualGluing: { enabled: false, pricePerUnit: 0 }
  }
};

const operationNames = {
  printing: 'Печать',
  digitalPrinting: 'Цифровая печать',
  lamination: 'Ламинация',
  uvCoating: 'УФ-лакировка',
  embossing: 'Тиснение',
  dieCutting: 'Вырубка',
  congreve: 'Конгрев',
  foil: 'Фольга',
  binding: 'Брошюровка',
  stapling: 'Скрепление скобой',
  thermalBinding: 'Термоклей',
  threadSewing: 'Ниткошвейка',
  folding: 'Фальцовка',
  mounting: 'Кашировка',
  threeDLacquer: '3D лак',
  threeDFoil: '3D фольга',
  spotLacquer: 'Выборочный лак',
  uvPrinting: 'UV печать',
  plotter: 'Плоттерная резка',
  foldGluing: 'Фальц-склейка',
  manualGluing: 'Ручная склейка'
};

const Calculator = () => {
  const [components, setComponents] = useState([{ ...initialComponentData, id: 1, name: 'Компонент 1' }]);
  const [totalResults, setTotalResults] = useState({
    totalCost: 0,
    totalPriceWithoutVAT: 0,
    totalPriceWithVAT: 0
  });

  const prices = {
    formats: {
      A1: { printSetup: 900000, printPerUnit: 220, forms: 280000 },
      A2: { printSetup: 400000, printPerUnit: 120, forms: 160000 },
      A3: { printSetup: 200000, printPerUnit: 80, forms: 100000 }
    },
    digitalPrinting: {
      SRA3: { single: 2500, double: 5000 },
      large: { single: 4000, double: 7000 }
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
      },
      binding: {
        ringPrice: 80
      },
      stapling: {
        base: 1000,
        bulk: 500,
        bulkThreshold: 100
      },
      thermalBinding: {
        perBlock: 3000
      },
      threadSewing: {
        perSignature: 200
      },
      folding: {
        perFold: 20
      },
      mounting: {
        A3: 3000,
        A2: 6000,
        A1: 12000
      },
      threeDLacquer: {
        A3: 8000,
        A2: 12000,
        A1: null
      },
      threeDFoil: {
        A3: 18000,
        A2: 29000,
        A1: null
      },
      spotLacquer: {
        A3: { base: 400000, perUnit: 400, threshold: 1000 },
        A2: { base: 600000, perUnit: 600, threshold: 1000 },
        A1: { base: 1200000, perUnit: 1200, threshold: 1000 }
      },
      uvPrinting: {
        basePricePerM2: 200000,
        whitePricePerM2: 400000
      },
      plotter: {
        A3: 12000,
        A2: 12000
      },
      foldGluing: {
        setup: 100000,
        perUnit: 30
      }
    }
  };

  const calculateComponentCost = (component) => {
    const sheetsPerProduct = Math.ceil(component.pagesPerProduct / component.sharesPerSheet);
    const totalSheets = (Math.ceil(component.quantity * sheetsPerProduct) + component.setupSheets) * component.printedSheets;
    const totalArea = totalSheets * component.sheetArea;
    const paperWeight = totalArea * component.paperWeight;
    
    const paperCost = component.priceType === 'kg' 
      ? paperWeight * component.paperPrice 
      : totalSheets * component.paperPrice;

    let printingCost = 0;
    let formsCost = 0;

    if (component.options.printing.enabled && !component.options.digitalPrinting.enabled) {
      const format = prices.formats[component.format];
      const printMultiplier = component.options.printing.doubleSided ? 2 : 1;
      printingCost = (format.printSetup + 
        (component.quantity > 1000 ? (component.quantity - 1000) * format.printPerUnit : 0)) * printMultiplier;
      
      const formsMultiplier = component.options.printing.doubleForms ? 2 : 1;
      formsCost = format.forms * printMultiplier * component.printedSheets * formsMultiplier;
    } else if (component.options.digitalPrinting.enabled) {
      const digitalPrices = prices.digitalPrinting[component.options.digitalPrinting.largeFormat ? 'large' : 'SRA3'];
      const pricePerSheet = component.options.digitalPrinting.doubleSided ? digitalPrices.double : digitalPrices.single;
      const totalDigitalSheets = Math.ceil(component.quantity * sheetsPerProduct);
      printingCost = pricePerSheet * totalDigitalSheets;
      formsCost = 0; // При цифровой печати формы не нужны
    }

    let additionalCost = 0;

    // Lamination (ламинация)
    if (component.options.lamination.enabled) {
      const laminationCost = totalArea * 1500;
      additionalCost += laminationCost * (component.options.lamination.doubleSided ? 2 : 1);
    }

    // Die Cutting (вырубка)
    if (component.options.dieCutting.enabled) {
      const dieCutting = prices.operations.dieCutting[component.format];
      const baseCost = dieCutting.base || 0;
      const perUnitCost = totalSheets * dieCutting.perUnit;
      additionalCost += (baseCost + perUnitCost) * (component.options.dieCutting.doubleSided ? 2 : 1);
    }

    // Spot Lacquer (выборочный лак)
    if (component.options.spotLacquer.enabled) {
      const spotLacquer = prices.operations.spotLacquer[component.format];
      const baseCost = spotLacquer.base;
      const extraSheets = Math.max(0, totalSheets - spotLacquer.threshold);
      const extraCost = extraSheets * spotLacquer.perUnit;
      additionalCost += baseCost + extraCost;
    }

    if (component.options.uvCoating.enabled) {
      additionalCost += totalArea * 1100 * (component.options.uvCoating.doubleSided ? 2 : 1);
    }

    if (component.options.embossing.enabled) {
      additionalCost += totalArea * 1500 * (component.options.embossing.doubleSided ? 2 : 1);
    }

    if (component.options.congreve.enabled) {
      const congreve = prices.operations.congreve[component.format];
      const cost = congreve.base + (component.quantity > 1000 ? (component.quantity - 1000) * congreve.perUnit : 0);
      additionalCost += cost * (component.options.congreve.doubleSided ? 2 : 1);
    }

    if (component.options.foil.enabled) {
      additionalCost += 150000;
    }

    // Binding (кольца)
    if (component.options.binding.enabled) {
      additionalCost += prices.operations.binding.ringPrice * component.options.binding.ringsCount * component.quantity;
    }

    // Stapling (скоба)
    if (component.options.stapling.enabled) {
      const { base, bulk, bulkThreshold } = prices.operations.stapling;
      additionalCost += component.quantity <= bulkThreshold 
        ? base * component.quantity 
        : bulk * component.quantity;
    }

    // Thermal binding (термоклей)
    if (component.options.thermalBinding.enabled) {
      additionalCost += prices.operations.thermalBinding.perBlock * component.quantity;
    }

    // Thread sewing (ниткошвейка)
    if (component.options.threadSewing.enabled) {
      additionalCost += prices.operations.threadSewing.perSignature * 
        component.options.threadSewing.signatures * component.quantity;
    }

    // Folding (фальцовка)
    if (component.options.folding.enabled) {
      additionalCost += prices.operations.folding.perFold * 
        component.options.folding.folds * totalSheets;
    }

    // Mounting (кашировка)
    if (component.options.mounting.enabled) {
      additionalCost += prices.operations.mounting[component.format] * totalSheets;
    }

    // 3D Lacquer (3д лак)
    if (component.options.threeDLacquer.enabled) {
      const price = prices.operations.threeDLacquer[component.format];
      if (price === null) {
        console.warn('3D лак недоступен для формата ' + component.format);
      } else {
        additionalCost += price * totalSheets;
      }
    }

    // 3D Foil (3д фольга)
    if (component.options.threeDFoil.enabled) {
      const price = prices.operations.threeDFoil[component.format];
      if (price === null) {
        console.warn('3D фольга недоступна для формата ' + component.format);
      } else {
        additionalCost += price * totalSheets;
      }
    }

    // UV Printing (UV печать)
    if (component.options.uvPrinting.enabled) {
      const pricePerM2 = component.options.uvPrinting.whiteColor 
        ? prices.operations.uvPrinting.whitePricePerM2 
        : prices.operations.uvPrinting.basePricePerM2;
      additionalCost += pricePerM2 * totalArea;
    }

    // Plotter (плоттер)
    if (component.options.plotter.enabled) {
      additionalCost += prices.operations.plotter[component.format] * totalSheets;
    }

    // Fold Gluing (фальц-склейка)
    if (component.options.foldGluing.enabled) {
      additionalCost += prices.operations.foldGluing.setup + 
        (prices.operations.foldGluing.perUnit * component.quantity);
    }

    // Manual Gluing (ручная склейка)
    if (component.options.manualGluing.enabled) {
      additionalCost += component.options.manualGluing.pricePerUnit * component.quantity;
    }

    const totalCost = paperCost + printingCost + formsCost + additionalCost;
    
    // Определяем сумму операций, не подлежащих вычету НДС
    const noVatDeductionCost = (component.options.manualGluing.enabled ? component.options.manualGluing.pricePerUnit * component.quantity : 0) +
      (component.options.spotLacquer.enabled ? (baseCost + extraCost) : 0) +
      (component.options.mounting.enabled ? prices.operations.mounting[component.format] * totalSheets : 0);
    
    // Вычет НДС только для операций, подлежащих вычету
    const vatDeduction = (totalCost - noVatDeductionCost) * 0.115;
    const priceWithoutVAT = totalCost * (1 + (component.profitMargin / 100));
    const priceWithVAT = priceWithoutVAT * 1.12 - vatDeduction;

    return {
      sheets: totalSheets,
      sheetsPerProduct,
      pagesPerProduct: component.pagesPerProduct,
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
        perUnit: priceWithVAT / component.quantity
      }
    };
  };

  useEffect(() => {
    let totalCost = 0;
    let totalPriceWithoutVAT = 0;
    let totalPriceWithVAT = 0;

    components.forEach(component => {
      const results = calculateComponentCost(component);
      totalCost += results.costs.total;
      totalPriceWithoutVAT += results.prices.withoutVAT;
      totalPriceWithVAT += results.prices.withVAT;
    });

    setTotalResults({
      totalCost,
      totalPriceWithoutVAT,
      totalPriceWithVAT
    });
  }, [components]);

  const addComponent = () => {
    const newId = components.length + 1;
    setComponents([
      ...components,
      { 
        ...initialComponentData, 
        id: newId,
        name: `Компонент ${newId}`
      }
    ]);
  };

  const removeComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateComponent = (id, field, value) => {
    setComponents(components.map(component => {
      if (component.id === id) {
        if (field.includes('.')) {
          const [category, subfield] = field.split('.');
          return {
            ...component,
            [category]: {
              ...component[category],
              [subfield]: value
            }
          };
        }
        return { ...component, [field]: value };
      }
      return component;
    }));
  };

  const updateComponentOption = (id, option, field, value) => {
    setComponents(components.map(component => {
      if (component.id === id) {
        return {
          ...component,
          options: {
            ...component.options,
            [option]: {
              ...component.options[option],
              [field]: value
            }
          }
        };
      }
      return component;
    }));
  };

  return (
    <div className="space-y-6">
      {components.map((component, index) => {
        const results = calculateComponentCost(component);
        return (
          <Card key={component.id} className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <CardTitle className="text-xl font-bold">
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
                    className="border-none bg-transparent font-bold text-xl"
                    placeholder="Название компонента"
                  />
                </CardTitle>
              </div>
              {components.length > 1 && (
                <button
                  onClick={() => removeComponent(component.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Тираж</label>
                    <input
                      type="number"
                      value={component.quantity}
                      onChange={(e) => updateComponent(component.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Формат</label>
                    <select
                      value={component.format}
                      onChange={(e) => {
                        const newFormat = e.target.value;
                        if (newFormat === 'A1') {
                          // Отключаем 3D операции при переключении на A1
                          if (component.options.threeDLacquer.enabled) {
                            updateComponentOption(component.id, 'threeDLacquer', 'enabled', false);
                          }
                          if (component.options.threeDFoil.enabled) {
                            updateComponentOption(component.id, 'threeDFoil', 'enabled', false);
                          }
                        }
                        updateComponent(component.id, 'format', newFormat);
                      }}
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
                      value={component.sharesPerSheet}
                      onChange={(e) => updateComponent(component.id, 'sharesPerSheet', parseInt(e.target.value) || 1)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Листов в изделии</label>
                    <input
                      type="number"
                      value={component.pagesPerProduct}
                      onChange={(e) => updateComponent(component.id, 'pagesPerProduct', parseInt(e.target.value) || 1)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Листы на приладку</label>
                    <input
                      type="number"
                      value={component.setupSheets}
                      onChange={(e) => updateComponent(component.id, 'setupSheets', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Количество печатных листов</label>
                    <input
                      type="number"
                      value={component.printedSheets}
                      onChange={(e) => updateComponent(component.id, 'printedSheets', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Площадь листа (м²)</label>
                    <input
                      type="number"
                      value={component.sheetArea}
                      onChange={(e) => updateComponent(component.id, 'sheetArea', parseFloat(e.target.value) || 0)}
                      step="0.001"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Граммаж (г/м²)</label>
                    <input
                      type="number"
                      value={component.paperWeight}
                      onChange={(e) => updateComponent(component.id, 'paperWeight', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Тип цены</label>
                    <select
                      value={component.priceType}
                      onChange={(e) => updateComponent(component.id, 'priceType', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    >
                      <option value="kg">За килограмм</option>
                      <option value="sheet">За лист</option>
                    </select>
                    <input
                      type="number"
                      value={component.paperPrice}
                      onChange={(e) => updateComponent(component.id, 'paperPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                      placeholder={component.priceType === 'kg' ? 'Цена за кг' : 'Цена за лист'}
                    />
                  </div>
                </div>

                <div className="grid grid-1 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Норма рентабельности (%)</label>
                    <input
                      type="number"
                      value={component.profitMargin}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0 && value < 100) {
                          updateComponent(component.id, 'profitMargin', value);
                        }
                      }}
                      min="0"
                      max="99.9"
                      step="0.1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Операции:</h3>
                  
                  {/* Группы операций */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Основные операции */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-600">Основные операции</h4>
                      <div className="space-y-2">
                        {/* Печать */}
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={component.options.printing.enabled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Отключаем цифровую печать при включении обычной
                                  updateComponentOption(component.id, 'digitalPrinting', 'enabled', false);
                                }
                                updateComponentOption(component.id, 'printing', 'enabled', e.target.checked);
                              }}
                              className="rounded"
                            />
                            <span className="font-medium">{operationNames.printing}</span>
                          </label>
                          {component.options.printing.enabled && (
                            <div className="pl-6 mt-2 space-y-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={component.options.printing.doubleSided}
                                  onChange={(e) => updateComponentOption(component.id, 'printing', 'doubleSided', e.target.checked)}
                                  className="rounded"
                                />
                                <span>Двусторонняя</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={component.options.printing.doubleForms}
                                  onChange={(e) => updateComponentOption(component.id, 'printing', 'doubleForms', e.target.checked)}
                                  className="rounded"
                                />
                                <span>Двойной комплект форм</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Цифровая печать */}
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={component.options.digitalPrinting.enabled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Отключаем обычную печать при включении цифровой
                                  updateComponentOption(component.id, 'printing', 'enabled', false);
                                }
                                updateComponentOption(component.id, 'digitalPrinting', 'enabled', e.target.checked);
                              }}
                              className="rounded"
                            />
                            <span className="font-medium">{operationNames.digitalPrinting}</span>
                          </label>
                          {component.options.digitalPrinting.enabled && (
                            <div className="pl-6 mt-2 space-y-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={component.options.digitalPrinting.doubleSided}
                                  onChange={(e) => updateComponentOption(component.id, 'digitalPrinting', 'doubleSided', e.target.checked)}
                                  className="rounded"
                                />
                                <span>Двусторонняя (4+4)</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={component.options.digitalPrinting.largeFormat}
                                  onChange={(e) => updateComponentOption(component.id, 'digitalPrinting', 'largeFormat', e.target.checked)}
                                  className="rounded"
                                />
                                <span>Формат 70х32см</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Отделочные операции */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-600">Отделочные операции</h4>
                      <div className="space-y-2">
                        {['lamination', 'uvCoating', 'embossing', 'dieCutting', 'congreve', 'foil', 'threeDLacquer', 'threeDFoil', 'spotLacquer', 'uvPrinting'].map((key) => (
                          <div key={key} className="p-3 bg-white rounded-lg shadow-sm">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={component.options[key].enabled}
                                onChange={(e) => updateComponentOption(component.id, key, 'enabled', e.target.checked)}
                                className="rounded"
                                disabled={['threeDLacquer', 'threeDFoil'].includes(key) && component.format === 'A1'}
                              />
                              <span className="font-medium">{operationNames[key]}</span>
                              {['threeDLacquer', 'threeDFoil'].includes(key) && component.format === 'A1' && (
                                <span className="text-red-500 text-sm">(недоступно для A1)</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Послепечатные операции */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-600">Послепечатные операции</h4>
                      <div className="space-y-2">
                        {/* Фальц-склейка */}
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={component.options.foldGluing.enabled}
                              onChange={(e) => updateComponentOption(component.id, 'foldGluing', 'enabled', e.target.checked)}
                              className="rounded"
                            />
                            <span className="font-medium">{operationNames.foldGluing}</span>
                          </label>
                        </div>

                        {/* Ручная склейка */}
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={component.options.manualGluing.enabled}
                              onChange={(e) => updateComponentOption(component.id, 'manualGluing', 'enabled', e.target.checked)}
                              className="rounded"
                            />
                            <span className="font-medium">{operationNames.manualGluing}</span>
                          </label>
                          {component.options.manualGluing.enabled && (
                            <div className="pl-6 mt-2">
                              <label className="block text-sm">Цена за единицу:</label>
                              <input
                                type="number"
                                value={component.options.manualGluing.pricePerUnit}
                                onChange={(e) => updateComponentOption(component.id, 'manualGluing', 'pricePerUnit', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          )}
                        </div>

                        {/* Остальные послепечатные операции */}
                        {['binding', 'stapling', 'thermalBinding', 'threadSewing', 'folding', 'mounting', 'plotter'].map((key) => (
                          <div key={key} className="p-3 bg-white rounded-lg shadow-sm">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={component.options[key].enabled}
                                onChange={(e) => updateComponentOption(component.id, key, 'enabled', e.target.checked)}
                                className="rounded"
                              />
                              <span className="font-medium">{operationNames[key]}</span>
                            </label>
                            {/* Дополнительные поля для операций */}
                            {component.options[key].enabled && (
                              <div className="pl-6 mt-2">
                                {key === 'binding' && (
                                  <>
                                    <label className="block text-sm">Количество колец:</label>
                                    <input
                                      type="number"
                                      value={component.options.binding.ringsCount}
                                      onChange={(e) => updateComponentOption(component.id, 'binding', 'ringsCount', parseInt(e.target.value) || 1)}
                                      min="1"
                                      className="w-full p-2 border rounded"
                                    />
                                  </>
                                )}
                                {key === 'threadSewing' && (
                                  <>
                                    <label className="block text-sm">Количество тетрадей:</label>
                                    <input
                                      type="number"
                                      value={component.options.threadSewing.signatures}
                                      onChange={(e) => updateComponentOption(component.id, 'threadSewing', 'signatures', parseInt(e.target.value) || 1)}
                                      min="1"
                                      className="w-full p-2 border rounded"
                                    />
                                  </>
                                )}
                                {key === 'folding' && (
                                  <>
                                    <label className="block text-sm">Количество фальцев:</label>
                                    <input
                                      type="number"
                                      value={component.options.folding.folds}
                                      onChange={(e) => updateComponentOption(component.id, 'folding', 'folds', parseInt(e.target.value) || 1)}
                                      min="1"
                                      className="w-full p-2 border rounded"
                                    />
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded space-y-2">
                  <h3 className="font-medium">Результаты расчета:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <span>Листов в изделии:</span>
                    <span className="text-right">{component.pagesPerProduct}</span>
                    
                    <span>Печатных листов на изделие:</span>
                    <span className="text-right">{results.sheetsPerProduct}</span>

                    <span>Количество печатных листов:</span>
                    <span className="text-right">{component.printedSheets}</span>
                    
                    <span>Общее количество листов с приладкой:</span>
                    <span className="text-right">{results.sheets}</span>
                    
                    <span>Общая площадь (м²):</span>
                    <span className="text-right">{results.totalArea.toFixed(2)}</span>
                    
                    <span>Вес бумаги (кг):</span>
                    <span className="text-right">{results.paperWeight.toFixed(2)}</span>
                    
                    <span>Стоимость бумаги:</span>
                    <span className="text-right">
                      {results.costs.paper.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.costs.paper / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span>Стоимость печати
                      {component.options.printing.enabled ? 
                        (component.options.printing.doubleSided ? ' (офсетная двусторонняя)' : ' (офсетная односторонняя)') :
                        component.options.digitalPrinting.enabled ? 
                          (component.options.digitalPrinting.doubleSided ? 
                            (component.options.digitalPrinting.largeFormat ? ' (цифровая 70х32см 4+4)' : ' (цифровая SRA3 4+4)') :
                            (component.options.digitalPrinting.largeFormat ? ' (цифровая 70х32см 4+0)' : ' (цифровая SRA3 4+0)')
                          ) : ''
                      }:
                    </span>
                    <span className="text-right">
                      {results.costs.printing.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.costs.printing / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span>Стоимость форм{component.options.printing.doubleForms ? ' (двойной комплект)' : ''}:</span>
                    <span className="text-right">
                      {results.costs.forms.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.costs.forms / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span>Доп. операции:</span>
                    <span className="text-right">
                      {results.costs.additional.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.costs.additional / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span className="font-medium">Общая себестоимость:</span>
                    <span className="text-right font-medium">
                      {results.costs.total.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.costs.total / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span>Цена без НДС:</span>
                    <span className="text-right">
                      {results.prices.withoutVAT.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({(results.prices.withoutVAT / component.quantity).toFixed(2)} за ед.)
                      </span>
                    </span>
                    
                    <span>Цена с НДС (12%):</span>
                    <span className="text-right">
                      {results.prices.withVAT.toFixed(2)}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({results.prices.perUnit.toFixed(2)} за ед.)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-center">
        <button
          onClick={addComponent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Добавить компонент
        </button>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Общая стоимость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Общая себестоимость:</span>
            <span className="text-right font-medium">
              {totalResults.totalCost.toFixed(2)}
              <br />
              <span className="text-sm text-gray-500">
                ({(totalResults.totalCost / components.reduce((sum, comp) => sum + comp.quantity, 0)).toFixed(2)} средняя цена за ед.)
              </span>
            </span>
            
            <span>Общая цена без НДС:</span>
            <span className="text-right">
              {totalResults.totalPriceWithoutVAT.toFixed(2)}
              <br />
              <span className="text-sm text-gray-500">
                ({(totalResults.totalPriceWithoutVAT / components.reduce((sum, comp) => sum + comp.quantity, 0)).toFixed(2)} средняя цена за ед.)
              </span>
            </span>
            
            <span>Общая цена с НДС (12%):</span>
            <span className="text-right">
              {totalResults.totalPriceWithVAT.toFixed(2)}
              <br />
              <span className="text-sm text-gray-500">
                ({(totalResults.totalPriceWithVAT / components.reduce((sum, comp) => sum + comp.quantity, 0)).toFixed(2)} средняя цена за ед.)
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator; 