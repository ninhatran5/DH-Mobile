const negativeWords = [
  "xấu", "tệ", "rác", "lởm", "đểu", "kém", "dỏm", "giả", "nhái", 
  "rởm", "vứt đi", "hư", "lỗi", "trầy", "cũ", "kém chất lượng", 
  "hỏng", "nát", "rơi vỡ", "hàng dựng", "hàng rác", "phế phẩm", 
  "fake", "rởm đời", "tệ hại", "dở ẹc", "thảm hại", "kinh khủng",
  "dỏm đời", "hàng nhái", "dởm chất", "nát bét", "tồi tệ", 
  "bẩn", "méo mó", "mất zin", "mất nguyên bản", "lỗi thời", "rác rưởi",

  "lừa đảo", "gian thương", "ăn cắp", "lừa bịp", "chặt chém", 
  "bịp bợm", "vô trách nhiệm", "hỗ trợ tệ", "không uy tín", 
  "treo đầu dê bán thịt chó", "thái độ kém", "phục vụ tệ", 
  "không bảo hành", "bom hàng", "treo máy", "hứa lèo", 
  "giao sai hàng", "giao chậm", "dịch vụ tệ", "treo khách", 
  "quỵt tiền", "quỵt nợ", "ăn chặn", "gian dối", "bán lừa", 
  "dối trá", "lươn lẹo", "không trung thực", "bán ẩu", "bán bậy",

  "địt", "đmm", "đm", "dm", "đmẹ", "địt mẹ", "đm bố", "cđt", "clgt", 
  "clm", "cl", "lồn", "buồi", "buoi", "cặc", "cak", "cẹc", "kặt", 
  "mẹ mày", "bố mày", "thằng ngu", "con chó", "óc chó", "óc lợn", 
  "óc trâu", "đần", "ngu", "ngu lồn", "ngu si", "đần độn", 
  "khốn nạn", "mất dạy", "láo", "láo toét", "súc vật", "chó chết", 
  "thằng điên", "thằng ranh", "đồ ngu", "vô học", "bẩn thỉu", "cặn bã", 
  "vô dụng", "ngu xuẩn", "ngốc nghếch", "não chó", "não lợn", 
  "chó má", "đểu cáng", "khốn kiếp", "khốn khổ", "ngu ngục", 
  "câm mồm", "cút", "cút mẹ", "biến đi", "xéo đi", "mất nết", "chết tiệt", 
  "đồ tồi", "đồ rác", "đồ bỏ", "hèn", "hèn hạ", "đồ hèn",

  "ức chế", "bực mình", "bực tức", "khó chịu", "chán", 
  "chán ghét", "thất vọng", "quá đáng", "tởm", "kinh tởm", 
  "ghê tởm", "đáng ghét", "phiền phức", "phiền toái", "chán ngán", 
  "ngán ngẩm", "khó ưa", "chướng mắt", "khó chịu vãi", "ức chế vl", 
  "chán đời", "quá dở", "nản", "bất mãn", "ghê gớm", "ngứa mắt", 
  "khó ở", "bực bội", "tồi", "thảm", "hết chịu nổi",


    "fuck", "fuk", "f***", "fking", "fk", "fucking", "motherfucker", "mf",
  "shit", "bullshit", "bs", "crap", "damn", "dammit", 
  "asshole", "jerk", "bastard", "bitch", "son of a bitch", 
  "slut", "whore", "hoe", "prostitute",
  "dick", "cock", "pussy", "cunt", "prick", "wanker",
  "dumbass", "stupid", "idiot", "moron", "retard", "loser", 
  "scumbag", "garbage", "trash", "useless", "worthless", 
  "pathetic", "lame", "terrible", "awful", "disgusting", "gross",
  "nonsense", "fake", "liar", "cheater", "fraud", "scam", "scammer",
  "suck", "sucks", "you suck", "douche", "douchebag", 
  "pig", "dog", "coward", "weakling", "stinky", "dirty", "filthy"
];

export default negativeWords