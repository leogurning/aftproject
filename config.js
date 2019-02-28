module.exports = {
  serverport: 2000,
  secret: '!$3cret4@uth',
  database: 'mongodb+srv://guest:IniGuest01@lenocluster0-s2nns.mongodb.net/aftDb?ssl=true&authSource=admin&retryWrites=true',

  formatStrDate(strdate) {
    return `${strdate.slice(6, 10)}-${strdate.slice(3, 5)}-${strdate.slice(0, 2)}`;
  },
  formatUTCStartDate(d) {
    const dt = d.getUTCDate();
    const mo = d.getUTCMonth();
    const yr = d.getUTCFullYear();
    const dateUTC = new Date(Date.UTC(yr, mo, dt));
    dateUTC.setHours(0);
    return dateUTC;
  },
  formatUTCEndDate(d) {
    const dt = d.getUTCDate();
    const mo = d.getUTCMonth();
    const yr = d.getUTCFullYear();
    const dateUTC = new Date(Date.UTC(yr, mo, dt));
    dateUTC.setHours(23);
    dateUTC.setMinutes(59);
    dateUTC.setSeconds(59);
    return dateUTC;
  },
};
