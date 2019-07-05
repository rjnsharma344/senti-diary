import nltk
import sys
nltk.data.path.append('/home/elcot/PROGS/nltk_data')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
sid = SentimentIntensityAnalyzer()
ans = sid.polarity_scores(sys.argv[1])
print(ans['compound'])
