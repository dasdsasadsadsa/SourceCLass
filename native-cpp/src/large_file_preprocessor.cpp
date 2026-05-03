#include "sourceclass_native.h"

#include <sstream>

namespace sourceclass_native {

std::vector<SplitPoint> find_safe_split_points(const std::string& text) {
  std::vector<SplitPoint> points;
  std::istringstream stream(text);
  std::string line;
  std::size_t line_number = 1;

  while (std::getline(stream, line)) {
    const auto trimmed_start = line.find_first_not_of(" \t");
    const std::string trimmed = trimmed_start == std::string::npos ? "" : line.substr(trimmed_start);
    if (trimmed.rfind("class ", 0) == 0 || trimmed.rfind("struct ", 0) == 0 ||
        trimmed.rfind("void ", 0) == 0 || trimmed.rfind("int ", 0) == 0 ||
        trimmed.rfind("auto ", 0) == 0) {
      points.push_back({line_number, "symbol_boundary"});
    }
    ++line_number;
  }

  if (points.empty()) {
    points.push_back({1, "file_start"});
  }

  return points;
}

}  // namespace sourceclass_native
