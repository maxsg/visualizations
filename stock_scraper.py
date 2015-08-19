from urllib import urlopen


def get_data():
	csv = urlopen("http://www.nasdaq.com/quotes/nasdaq-100-stocks.aspx?render=download")
	format = csv.readline().strip()
	keys = format.split(",")[:-1] # remove the newline/return chars

	stock_prices = {"children" : []} # need to pass dict to jsonify
	for line in csv:
		line = line.strip()
		stock = {}
		values = line.split(",")[:-1] # remove the newline/return chars
		for i in range(len(values)):
			stock[keys[i].strip()] = values[i].strip()
		stock_prices['children'].append(stock)

	return stock_prices
