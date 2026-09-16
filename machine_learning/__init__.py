"""machine_learning package: Deep Knowledge Tracing pipeline.

Exposes the inference entry-point that the Flask backend integrates with, plus
the preprocessing, clustering and model subpackages. Note that importing this
package does not require PyTorch; it is resolved lazily at inference time.
"""

__version__ = "0.1.0"

__all__ = ["__version__"]