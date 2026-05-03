#include "sourceclass_native.h"

#include <algorithm>
#include <cctype>
#include <iostream>

namespace sourceclass_native {

std::size_t count_lines(const std::string& text) {
  if (text.empty()) {
    return 0;
  }
  return static_cast<std::size_t>(std::count(text.begin(), text.end(), '\n') + 1);
}

double estimate_token_density(const std::string& text) {
  if (text.empty()) {
    return 0.0;
  }
  std::size_t wordish = 0;
  bool in_token = false;
  for (char value : text) {
    if (std::isalnum(static_cast<unsigned char>(value)) || value == '_') {
      if (!in_token) {
        ++wordish;
        in_token = true;
      }
    } else {
      in_token = false;
    }
  }
  return static_cast<double>(std::max<std::size_t>(wordish, 1)) / static_cast<double>(text.size());
}

}  // namespace sourceclass_native

#ifdef SOURCECLASS_NATIVE_SMOKE
int main() {
  const std::string sample = "int main() {\n  return 0;\n}\n";
  std::cout << "lines=" << sourceclass_native::count_lines(sample) << "\n";
  std::cout << "density=" << sourceclass_native::estimate_token_density(sample) << "\n";
  return 0;
}
#endif
