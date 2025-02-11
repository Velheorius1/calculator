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
  options: {
    printing: { enabled: true, doubleSided: false },
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
    spotLacquer: { enabled: false },
    uvPrinting: { enabled: false, whiteColor: false },
    plotter: { enabled: false }
  }
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
        A3: 15000,
        A2: 25000
      }
    }
  };

  const calculateComponentCost = (component) => {
    const sheetsPerProduct = Math.ceil(component.pagesPerProduct / component.sharesPerSheet);
    const totalSheets = Math.ceil(component.quantity * sheetsPerProduct) + component.setupSheets;
    const totalArea = totalSheets * component.sheetArea;
    const paperWeight = totalArea * component.paperWeight;
    
    const paperCost = component.priceType === 'kg' 
      ? paperWeight * component.paperPrice 
      : totalSheets * component.paperPrice;

    const format = prices.formats[component.format];
    const printMultiplier = component.options.printing.doubleSided ? 2 : 1;
    const printingCost = (format.printSetup + 
      (component.quantity > 1000 ? (component.quantity - 1000) * format.printPerUnit : 0)) * printMultiplier;
    const formsCost = format.forms * printMultiplier;

    let additionalCost = 0;

    if (component.options.lamination.enabled) {
      additionalCost += totalArea * 1500 * (component.options.lamination.doubleSided ? 2 : 1);
    }

    if (component.options.uvCoating.enabled) {
      additionalCost += totalArea * 1100 * (component.options.uvCoating.doubleSided ? 2 : 1);
    }

    if (component.options.dieCutting.enabled) {
      const dieCutting = prices.operations.dieCutting[component.format];
      const cost = (dieCutting.base || 0) + (totalSheets * dieCutting.perUnit);
      additionalCost += cost * (component.options.dieCutting.doubleSided ? 2 : 1);
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

    // Spot Lacquer (выборочный трафаретный лак)
    if (component.options.spotLacquer.enabled) {
      const spotLacquer = prices.operations.spotLacquer[component.format];
      additionalCost += spotLacquer.base;
      if (totalSheets > spotLacquer.threshold) {
        additionalCost += (totalSheets - spotLacquer.threshold) * spotLacquer.perUnit;
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

    const totalCost = paperCost + printingCost + formsCost + additionalCost;
    const vatDeduction = totalCost * 0.115;
    const priceWithoutVAT = totalCost / (1 - (component.profitMargin / 100));
    const priceWithVAT = (priceWithoutVAT * 1.12) - vatDeduction;

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Листы на приладку</label>
                    <input
                      type="number"
                      value={component.setupSheets}
                      onChange={(e) => updateComponent(component.id, 'setupSheets', parseInt(e.target.value) || 0)}
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
                      onChange={(e) => updateComponent(component.id, 'profitMargin', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Операции:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Стандартные операции с двусторонней опцией */}
                    {['printing', 'lamination', 'uvCoating', 'embossing', 'dieCutting', 'congreve'].map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={component.options[key].enabled}
                            onChange={(e) => updateComponentOption(component.id, key, 'enabled', e.target.checked)}
                            className="rounded"
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                        {component.options[key].enabled && (
                          <label className="flex items-center space-x-2 pl-6">
                            <input
                              type="checkbox"
                              checked={component.options[key].doubleSided}
                              onChange={(e) => updateComponentOption(component.id, key, 'doubleSided', e.target.checked)}
                              className="rounded"
                            />
                            <span>Двусторонняя</span>
                          </label>
                        )}
                      </div>
                    ))}

                    {/* Простые операции без дополнительных опций */}
                    {['foil', 'thermalBinding'].map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={component.options[key].enabled}
                            onChange={(e) => updateComponentOption(component.id, key, 'enabled', e.target.checked)}
                            className="rounded"
                          />
                          <span>{key === 'foil' ? 'Фольга' : 'Термоклей'}</span>
                        </label>
                      </div>
                    ))}

                    {/* Брошюровка (кольца) */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.binding.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'binding', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Брошюровка</span>
                      </label>
                      {component.options.binding.enabled && (
                        <div className="pl-6">
                          <label className="block text-sm">Количество колец:</label>
                          <input
                            type="number"
                            value={component.options.binding.ringsCount}
                            onChange={(e) => updateComponentOption(component.id, 'binding', 'ringsCount', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                    </div>

                    {/* Скоба */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.stapling.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'stapling', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Скоба</span>
                      </label>
                    </div>

                    {/* Ниткошвейка */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.threadSewing.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'threadSewing', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Ниткошвейка</span>
                      </label>
                      {component.options.threadSewing.enabled && (
                        <div className="pl-6">
                          <label className="block text-sm">Количество тетрадей:</label>
                          <input
                            type="number"
                            value={component.options.threadSewing.signatures}
                            onChange={(e) => updateComponentOption(component.id, 'threadSewing', 'signatures', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                    </div>

                    {/* Фальцовка */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.folding.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'folding', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Фальцовка</span>
                      </label>
                      {component.options.folding.enabled && (
                        <div className="pl-6">
                          <label className="block text-sm">Количество фальцев:</label>
                          <input
                            type="number"
                            value={component.options.folding.folds}
                            onChange={(e) => updateComponentOption(component.id, 'folding', 'folds', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                    </div>

                    {/* Кашировка */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.mounting.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'mounting', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Кашировка</span>
                      </label>
                    </div>

                    {/* 3D лак */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.threeDLacquer.enabled}
                          onChange={(e) => {
                            if (e.target.checked && component.format === 'A1') {
                              alert('3D лак недоступен для формата A1');
                              return;
                            }
                            updateComponentOption(component.id, 'threeDLacquer', 'enabled', e.target.checked)
                          }}
                          className="rounded"
                          disabled={component.format === 'A1'}
                        />
                        <span>3D лак</span>
                        {component.format === 'A1' && (
                          <span className="text-red-500 text-sm">(недоступно для A1)</span>
                        )}
                      </label>
                    </div>

                    {/* 3D фольга */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.threeDFoil.enabled}
                          onChange={(e) => {
                            if (e.target.checked && component.format === 'A1') {
                              alert('3D фольга недоступна для формата A1');
                              return;
                            }
                            updateComponentOption(component.id, 'threeDFoil', 'enabled', e.target.checked)
                          }}
                          className="rounded"
                          disabled={component.format === 'A1'}
                        />
                        <span>3D фольга</span>
                        {component.format === 'A1' && (
                          <span className="text-red-500 text-sm">(недоступно для A1)</span>
                        )}
                      </label>
                    </div>

                    {/* Выборочный трафаретный лак */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.spotLacquer.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'spotLacquer', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Выборочный лак</span>
                      </label>
                    </div>

                    {/* UV печать */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.uvPrinting.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'uvPrinting', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>UV печать</span>
                      </label>
                      {component.options.uvPrinting.enabled && (
                        <label className="flex items-center space-x-2 pl-6">
                          <input
                            type="checkbox"
                            checked={component.options.uvPrinting.whiteColor}
                            onChange={(e) => updateComponentOption(component.id, 'uvPrinting', 'whiteColor', e.target.checked)}
                            className="rounded"
                          />
                          <span>С белым цветом</span>
                        </label>
                      )}
                    </div>

                    {/* Плоттер */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={component.options.plotter.enabled}
                          onChange={(e) => updateComponentOption(component.id, 'plotter', 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span>Плоттер</span>
                      </label>
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
                    
                    <span>Общее количество печатных листов:</span>
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
            <span className="text-right font-medium">{totalResults.totalCost.toFixed(2)}</span>
            
            <span>Общая цена без НДС:</span>
            <span className="text-right">{totalResults.totalPriceWithoutVAT.toFixed(2)}</span>
            
            <span>Общая цена с НДС:</span>
            <span className="text-right">{totalResults.totalPriceWithVAT.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator; 