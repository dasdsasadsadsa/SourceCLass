#pragma once

#include <cstddef>
#include <string>
#include <vector>

namespace sourceclass_native {

struct SplitPoint {
  std::size_t line;
  std::string reason;
};

struct SymbolHint {
  std::size_t line;
  std::string kind;
  std::string name;
};

std::size_t count_lines(const std::string& text);
double estimate_token_density(const std::string& text);
std::vector<SplitPoint> find_safe_split_points(const std::string& text);
std::vector<SymbolHint> extract_basic_symbols(const std::string& text);
std::vector<SplitPoint> detect_comment_regions(const std::string& text);

}  // namespace sourceclass_native
