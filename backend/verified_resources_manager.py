"""
Verified Resources Manager for LearnSphere
Provides curated learning resources (YouTube, PDF) mapped to specific skills
"""

import json
import os
import re
import time
from typing import Dict, List, Optional
from urllib.parse import quote
import requests
from functools import lru_cache
from threading import Thread

class VerifiedResourcesManager:
    """Manages verified learning resources with URL validation"""
    
    def __init__(self, json_path: str = None):
        """Initialize with verified resources JSON file"""
        if json_path is None:
            json_path = os.path.join(os.path.dirname(__file__), 'verified_resources.json')
        
        self.json_path = json_path
        self.resources = self._load_resources()
        self._url_cache = {}  # Cache for URL validation results
        self._failed_urls = set()  # Track failed URLs to avoid repeated checks
        
    def _load_resources(self) -> Dict:
        """Load verified resources from JSON file"""
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Error loading verified resources: {e}")
            return {"skills_database": {}, "career_roadmaps": {}}

    @staticmethod
    def _clean_search_query(query: str) -> str:
        """Normalize a search phrase into a safe, URL-friendly query string."""
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', query or '').strip().lower()
        return 'programming tutorial' if not cleaned else ' '.join(cleaned.split())

    @staticmethod
    def safe_youtube_url(query: str) -> str:
        """Construct a guaranteed-safe YouTube search URL (never 404s)."""
        search = VerifiedResourcesManager._clean_search_query(query)
        if not (search.endswith('course') or search.endswith('tutorial')):
            search = f"{search} course"
        return f"https://www.youtube.com/results?search_query={quote(search)}"

    @staticmethod
    def safe_pdf_url(query: str) -> str:
        """Construct a guaranteed-safe scholarly/PDF search URL (never 404s)."""
        search = VerifiedResourcesManager._clean_search_query(query)
        if not (search.endswith('pdf') or search.endswith('documentation')):
            search = f"{search} pdf"
        return f"https://scholar.google.com/scholar?q={quote(search)}"

    def resolve_skill_urls(self, skill: Dict, topic: str) -> Dict:
        """
        Anti-hallucination / anti-404 routing:
        For each youtube/pdf URL, return it ONLY if it is a plausible, live
        direct link. Otherwise substitute a guaranteed-safe search URL so the
        end user never hits a 404 page.
        """
        topic = topic or 'programming'
        youtube = skill.get('youtube', '')
        pdf = skill.get('pdf', '')
        return {
            'youtube': youtube if self._is_live_direct(youtube) else self.safe_youtube_url(topic),
            'youtube_title': skill.get('youtube_title', f'{topic} Tutorial'),
            'pdf': pdf if self._is_live_direct(pdf) else self.safe_pdf_url(topic),
            'pdf_title': skill.get('pdf_title', f'{topic} Resources'),
        }

    @classmethod
    def _is_live_direct(cls, url: str) -> bool:
        """Return True only if the URL is a plausible, reachable direct link."""
        if not url or not isinstance(url, str):
            return False
        # Must look like a real web URL, not a hallucinated placeholder.
        if not re.match(r'^https?://[^/]+\.[a-z]{2,}', url, re.IGNORECASE):
            return False
        try:
            cached = getattr(cls, '_live_cache', {})
            if url in cached:
                return cached[url]
            response = requests.head(url, timeout=3, allow_redirects=True)
            ok = bool(response) and response.status_code < 400
            cached[url] = ok
            setattr(cls, '_live_cache', cached)
            return ok
        except Exception:
            return False

    def get_skill_resources(self, skill_name: str) -> Optional[Dict]:
        """
        Get resources for a specific skill
        Returns: {'youtube': url, 'youtube_title': str, 'pdf': url, 'pdf_title': str}
        URLs are validated live, falling back to safe search URLs when dead.
        """
        skill_name_clean = skill_name.strip().title()

        # Try exact match first
        if skill_name_clean in self.resources.get('skills_database', {}):
            return self.resolve_skill_urls(self.resources['skills_database'][skill_name_clean], skill_name_clean)

        # Try case-insensitive match
        for skill, resources in self.resources.get('skills_database', {}).items():
            if skill.lower() == skill_name_clean.lower():
                return self.resolve_skill_urls(resources, skill_name_clean)

        return None
    
    def get_career_roadmap_with_resources(self, career_path: str) -> Optional[List[Dict]]:
        """
        Get complete roadmap for a career with all resource links
        Returns list of steps with embedded YouTube and PDF links
        """
        career_clean = career_path.strip()
        
        # Find matching career in database
        roadmap = None
        for career, steps in self.resources.get('career_roadmaps', {}).items():
            if career.lower() == career_clean.lower():
                roadmap = steps
                break
        
        if not roadmap:
            return None
        
        # Enrich roadmap with verified resources
        enriched_roadmap = []
        for i, step in enumerate(roadmap, 1):
            skill = step.get('skill', '')
            resources = self.get_skill_resources(skill)
            
            enriched_step = {
                'step': i,
                'title': f"{skill} Mastery",
                'description': f"Learn and master {skill} fundamentals and advanced concepts",
                'skill': skill,
                'duration': step.get('duration', '2 weeks'),
                'youtube': resources.get('youtube', '') if resources else '',
                'youtube_title': resources.get('youtube_title', f'{skill} Course') if resources else '',
                'pdf': resources.get('pdf', '') if resources else '',
                'pdf_title': resources.get('pdf_title', f'{skill} Resources') if resources else '',
            }
            enriched_roadmap.append(enriched_step)
        
        return enriched_roadmap
    
    def get_alternative_resources(self, skill_name: str, exclude_urls: List[str] = None) -> List[Dict]:
        """
        Get alternative resources for a skill if main resources fail
        Returns fallback resources
        """
        if exclude_urls is None:
            exclude_urls = []
        
        skill = self.get_skill_resources(skill_name)
        if not skill:
            return []
        
        alternatives = []
        
        # Add official documentation as fallback
        if skill.get('pdf') not in exclude_urls:
            alternatives.append({
                'type': 'documentation',
                'title': skill.get('pdf_title', 'Official Documentation'),
                'url': skill.get('pdf'),
                'source': 'official'
            })
        
        if skill.get('youtube') not in exclude_urls:
            alternatives.append({
                'type': 'video',
                'title': skill.get('youtube_title', 'Video Tutorial'),
                'url': skill.get('youtube'),
                'source': 'verified'
            })
        
        return alternatives
    
    @staticmethod
    def validate_url(url: str, timeout: int = 3) -> bool:
        """
        Validate if a URL is accessible (non-blocking, returns cached result if available)
        Returns: True if URL is accessible, False otherwise
        """
        if not url:
            return False
        
        try:
            # Quick HEAD request to check if URL exists
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            return response.status_code < 400
        except:
            return False
    
    def validate_resources_async(self, skill_name: str) -> Dict:
        """
        Validate skill resources asynchronously
        Returns: {'youtube_valid': bool, 'pdf_valid': bool, 'status': 'checking|ready'}
        """
        resources = self.get_skill_resources(skill_name)
        if not resources:
            return {'youtube_valid': False, 'pdf_valid': False, 'status': 'not_found'}
        
        # Check cache first
        cache_key = f"{skill_name}_validation"
        if cache_key in self._url_cache:
            return self._url_cache[cache_key]
        
        result = {
            'youtube_valid': self.validate_url(resources.get('youtube', '')),
            'pdf_valid': self.validate_url(resources.get('pdf', '')),
            'status': 'ready'
        }
        
        # Cache the result for 1 hour
        self._url_cache[cache_key] = result
        
        return result
    
    def search_resources_by_keyword(self, keyword: str) -> List[Dict]:
        """Search for skills matching a keyword"""
        keyword_lower = keyword.lower()
        matches = []
        
        for skill, resources in self.resources.get('skills_database', {}).items():
            if keyword_lower in skill.lower() or keyword_lower in resources.get('youtube_title', '').lower():
                matches.append({
                    'skill': skill,
                    'youtube_title': resources.get('youtube_title', ''),
                    'pdf_title': resources.get('pdf_title', '')
                })
        
        return matches


# Global instance
_resources_manager = None

def get_resources_manager() -> VerifiedResourcesManager:
    """Get or create global resources manager instance"""
    global _resources_manager
    if _resources_manager is None:
        _resources_manager = VerifiedResourcesManager()
    return _resources_manager


def get_roadmap_with_resources(career_path: str) -> Optional[List[Dict]]:
    """Convenience function to get enriched roadmap with all resources"""
    manager = get_resources_manager()
    return manager.get_career_roadmap_with_resources(career_path)


def get_skill_links(skill_name: str) -> Optional[Dict]:
    """Convenience function to get resource links for a specific skill"""
    manager = get_resources_manager()
    return manager.get_skill_resources(skill_name)


if __name__ == '__main__':
    # Test the resource manager
    manager = VerifiedResourcesManager()
    
    print("[OK] Verified Resources Manager Test\n")
    
    # Test 1: Get skill resources
    print("1. Testing Python skill resources:")
    python_resources = manager.get_skill_resources('Python')
    if python_resources:
        print(f"   YouTube: {python_resources['youtube_title']}")
        print(f"   PDF: {python_resources['pdf_title']}\n")
    
    # Test 2: Get full roadmap
    print("2. Testing Full Stack Developer roadmap:")
    roadmap = manager.get_career_roadmap_with_resources('Full Stack Developer')
    if roadmap:
        for step in roadmap:
            print(f"   Step {step['step']}: {step['title']}")
            print(f"      Duration: {step['duration']}")
            print(f"      YouTube: {step['youtube_title'][:50]}...")
            print()
    
    # Test 3: Validate URLs
    print("3. URL Validation Sample:")
    validation = manager.validate_resources_async('Python')
    print(f"   Python resources - YouTube valid: {validation['youtube_valid']}")
    print(f"   Python resources - PDF valid: {validation['pdf_valid']}\n")
    
    print("[OK] All tests completed!")
