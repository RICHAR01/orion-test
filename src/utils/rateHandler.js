import Bang from 'bang';
import to from 'await-to';

const rateValues = {
  bad: 60,
  meh: 70,
  good: 80,
  great: 90,
  perfect: 100
};

export async function increseSerieRate(Serie, rate) {
  const { data: serie, err: errSerie } = await to(Serie.findById(rate.serieId));
  if (errSerie) throw Bang.wrap(errSerie);
  if (!serie) throw Bang.notFound();

  let newSerieRate = rateValues[rate.rate];
  let newRatesQuantity = serie.ratesQuantity + 1;
  if (serie.ratesQuantity) {
    newRatesQuantity = serie.ratesQuantity + 1;
    newSerieRate = ( (serie.rate * serie.ratesQuantity) + rateValues[rate.rate] ) / newRatesQuantity;
  }

  const updateSerieStatement = {
    rate: Number(newSerieRate.toFixed(2)),
    ratesQuantity: newRatesQuantity
  };

  const { err: errUpSerie } = await to(Serie.updateById(serie.id, updateSerieStatement));
  if (errUpSerie) throw Bang.wrap(errUpSerie);

  return Promise.resolve();
}


export async function updateSerieRate(Serie, rate, currentRate) {
  const { data: serie, err: errSerie } = await to(Serie.findById(rate.serieId));
  if (errSerie) throw Bang.wrap(errSerie);
  if (!serie) throw Bang.notFound();

  let newSerieRate = rateValues[rate.rate];
  let oldSerieRate = rateValues[currentRate.rate];
  newSerieRate = ( (serie.rate * serie.ratesQuantity) - oldSerieRate +  newSerieRate ) / serie.ratesQuantity;
  const updateSerieStatement = {
    rate: Number(newSerieRate.toFixed(2))
  };

  const { err: errUpSerie } = await to(Serie.updateById(serie.id, updateSerieStatement));
  if (errUpSerie) throw Bang.wrap(errUpSerie);

  return Promise.resolve();
}


export async function decreseSerieRate(Serie, currentRate) {
  const { data: serie, err: errSerie } = await to(Serie.findById(currentRate.serieId));
  if (errSerie) throw Bang.wrap(errSerie);
  if (!serie) throw Bang.notFound();

  let currentSerieRate = rateValues[currentRate.rate];
  let newRatesQuantity = serie.ratesQuantity - 1;
  const newSerieRate = ( (serie.rate * serie.ratesQuantity) - currentSerieRate ) / newRatesQuantity;

  const updateSerieStatement = {
    rate: Number(newSerieRate.toFixed(2)),
    ratesQuantity: newRatesQuantity
  };

  const { err: errUpSerie } = await to(Serie.updateById(serie.id, updateSerieStatement));
  if (errUpSerie) throw Bang.wrap(errUpSerie);

  return Promise.resolve();
}
